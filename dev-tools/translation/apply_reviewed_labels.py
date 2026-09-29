"""Apply explicit, pack-scoped label reviews against the local English exports."""
import argparse
from audit_translation import leaves
from reuse_verified import ROOT, DATA, load, save, fields, technical, numbers


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Write reviewed labels; otherwise report only')
    args = parser.parse_args()
    reviews = load(ROOT / 'dev-tools/translation/reviewed-labels.json')
    changes, pending_writes = [], []
    for pack, mapping in reviews.items():
        name = f'dnd-dungeon-masters-guide.{pack}'
        original = load(DATA / f'{name}.en.json')
        path = ROOT / 'compendium' / f'{name}.json'
        translated = load(path)
        matched = set()
        for doc in original['documents']:
            source = dict(fields(doc, original['documentType']))
            entry = translated['entries'][doc['_id']]
            for address, before in leaves(entry):
                english = source.get(address)
                if address[-1] not in ('name', 'label', 'caption') or english not in mapping:
                    continue
                matched.add(english)
                after = mapping[english]
                if technical(english) != technical(after) or numbers(english) != numbers(after):
                    raise ValueError(f'Technical mismatch: {pack} {doc["_id"]} {address}')
                if before == after:
                    continue
                target = entry
                for key in address[:-1]:
                    target = target[key]
                target[address[-1]] = after
                changes.append({'pack': pack, 'id': doc['_id'], 'path': list(address),
                                'english': english, 'before': before, 'after': after})
        missing = set(mapping) - matched
        if missing:
            raise ValueError(f'Reviewed labels absent from {pack}: {sorted(missing)}')
        pending_writes.append((path, translated))
    if args.apply:
        for path, translated in pending_writes:
            save(path, translated)
        save(DATA / 'reviewed-labels-application.json', {'changes': changes})
    print(f'{len(changes)} label changes; mode={"apply" if args.apply else "preview"}')
    for pack in reviews:
        print(f'{pack}: {sum(c["pack"] == pack for c in changes)}')


if __name__ == '__main__':
    main()
