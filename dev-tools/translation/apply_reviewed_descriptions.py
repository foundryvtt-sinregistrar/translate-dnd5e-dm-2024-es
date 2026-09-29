"""Apply six explicitly reviewed equipment descriptions and their renamed links."""
import argparse
import re
from audit_translation import leaves
from reuse_verified import ROOT, DATA, load, save, technical, numbers


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    reviews = load(ROOT / 'dev-tools/translation/reviewed-descriptions.json')
    source = {d['_id']: d for d in load(DATA / 'dnd-dungeon-masters-guide.equipment.en.json')['documents']}
    files = {p: load(p) for p in (ROOT / 'compendium').glob('*.json')}
    equipment = files[ROOT / 'compendium/dnd-dungeon-masters-guide.equipment.json']['entries']
    changes = []
    renamed = {}
    for id, review in reviews.items():
        original = source[id]['system']['description']['value']
        text = review['description']
        if technical(original) != technical(text) or numbers(original) != numbers(text):
            raise ValueError(f'Changed references or figures: {id}')
        if re.findall(r'<[^>]+>', original) != re.findall(r'<[^>]+>', text):
            raise ValueError(f'Changed HTML structure: {id}')
        for field in ('name', 'description'):
            if field not in review:
                continue
            if equipment[id][field] != review[field]:
                changes.append(f'equipment:{id}:{field}')
                equipment[id][field] = review[field]
        if 'name' in review:
            renamed[id] = review['name']
    link = re.compile(r'(@(?:UUID|Embed)\[Compendium\.dnd-dungeon-masters-guide\.equipment\.Item\.([^ \]]+)[^\]]*\])\{([^}]+)\}')
    for path, data in files.items():
        for address, value in leaves(data['entries']):
            if not isinstance(value, str):
                continue
            def replace(match):
                # Only the reviewed previous name, not arbitrary contextual link labels.
                if match[2] in renamed and match[3].casefold() == 'daga de veneno':
                    return match[1] + '{' + renamed[match[2]] + '}'
                return match[0]
            after = link.sub(replace, value)
            if after != value:
                target = data['entries']
                for key in address[:-1]:
                    target = target[key]
                target[address[-1]] = after
                changes.append(f'{path.stem}:{".".join(address)}')
    if args.apply:
        for path, data in files.items():
            if any(change.startswith(path.stem+':') for change in changes) or (path.name.endswith('.equipment.json') and changes):
                save(path, data)
        save(DATA / 'reviewed-descriptions-application.json', {'changes': changes})
    print(f'{len(changes)} changed fields; mode={"apply" if args.apply else "preview"}')
    for change in changes:
        print(change)


if __name__ == '__main__':
    main()
