"""Apply reviewed document names and exact labels of links to those documents."""
import argparse
import re
from audit_translation import leaves
from reuse_verified import ROOT, DATA, load, save, technical, numbers, put


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    reviews = load(ROOT / 'dev-tools/translation/reviewed-names.json')
    files = {p.stem.rsplit('.', 1)[1]: (p, load(p)) for p in (ROOT / 'compendium').glob('*.json')}
    sources = {}
    targets = {}
    changes = []
    for review in reviews:
        pack, id = review['pack'], review['id']
        if pack not in sources:
            original = load(DATA / f'dnd-dungeon-masters-guide.{pack}.en.json')
            sources[pack] = {d['_id']: d for d in original['documents']}
        english, after = review['english'], review['name']
        if sources[pack][id]['name'] != english:
            raise ValueError(f'Changed source name: {pack}:{id}')
        if technical(english) != technical(after) or numbers(english) != numbers(after):
            raise ValueError(f'Changed references or numbers: {pack}:{id}')
        entry = files[pack][1]['entries'][id]
        allowed = {s.casefold() for s in [english, after, *review['previousNames']]}
        if entry['name'].casefold() not in allowed:
            raise ValueError(f'Unexpected existing name: {pack}:{id}')
        if entry['name'] != after:
            entry['name'] = after
            changes.append(f'{pack}:{id}:name')
        targets[(pack, id)] = (after, allowed)
    link = re.compile(r'(@(?:UUID|Embed)\[Compendium\.dnd-dungeon-masters-guide\.([^.]+)\.(?:Item|Actor|RollTable|JournalEntry|Scene)\.([^\]. #]+)(?: [^\]]*)?\])\{([^}]+)\}')
    for pack, (_, data) in files.items():
        for address, before in leaves(data['entries']):
            if not isinstance(before, str):
                continue
            def replace(match):
                reviewed = targets.get((match[2], match[3]))
                if not reviewed or match[4].casefold() not in reviewed[1]:
                    return match[0]
                return match[1] + '{' + reviewed[0] + '}'
            after = link.sub(replace, before)
            if after != before:
                if technical(before) != technical(after) or numbers(before) != numbers(after):
                    raise ValueError(f'Changed references or numbers: {pack}:{address}')
                put(data['entries'], address, after)
                changes.append(f'{pack}:{".".join(address)}')
    if args.apply:
        changed_packs = {c.split(':', 1)[0] for c in changes}
        for pack in changed_packs:
            save(*files[pack])
        save(DATA / 'reviewed-names-application.json', {'changes': changes})
    print(f'{len(changes)} changed fields; mode={"apply" if args.apply else "preview"}')


if __name__ == '__main__':
    main()
