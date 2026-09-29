"""Apply actor texts reviewed against exact SHA-256 fingerprints of DMG 2.0.0."""
import argparse
import hashlib
import re

from audit_translation import leaves
from reuse_verified import ROOT, DATA, load, save, fields, technical, numbers, put


def main(pack='actors'):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Write reviewed texts')
    args = parser.parse_args()
    stem = {'actors': 'actor', 'tables': 'table'}[pack]
    reviews = load(ROOT / f'dev-tools/translation/reviewed-{stem}-texts.json')
    original = load(DATA / f'dnd-dungeon-masters-guide.{pack}.en.json')
    path = ROOT / f'compendium/dnd-dungeon-masters-guide.{pack}.json'
    translated = load(path)
    matched, changes, reviewed_fields = set(), [], []
    for doc in original['documents']:
        source = dict(fields(doc, original['documentType']))
        entry = translated['entries'][doc['_id']]
        for address, before in leaves(entry):
            english = source.get(address)
            if not english or not english.strip():
                continue
            fingerprint = hashlib.sha256(english.encode('utf8')).hexdigest()
            if fingerprint not in reviews:
                continue
            if doc['_id'] not in reviews[fingerprint].get('documents', [doc['_id']]):
                continue
            after = reviews[fingerprint]['translation']
            if technical(english) != technical(after) or numbers(english) != numbers(after):
                raise ValueError(f'Changed references or figures: {doc["_id"]} {address}')
            if re.findall(r'<[^>]+>', english) != re.findall(r'<[^>]+>', after):
                raise ValueError(f'Changed HTML structure: {doc["_id"]} {address}')
            matched.add(fingerprint)
            record = {'id': doc['_id'], 'path': list(address), 'sourceSha256': fingerprint}
            reviewed_fields.append(record)
            if before != after:
                put(entry, address, after)
                changes.append(record)
    missing = set(reviews) - matched
    if missing:
        raise ValueError(f'Reviewed source texts absent: {sorted(missing)}')
    if args.apply:
        save(path, translated)
        save(DATA / f'reviewed-{stem}-texts-application.json',
             {'reviewedFields': reviewed_fields, 'changes': changes})
    print(f'{len(matched)} source texts, {len(reviewed_fields)} reviewed fields, '
          f'{len(changes)} changes; mode={"apply" if args.apply else "preview"}')


if __name__ == '__main__':
    main()
