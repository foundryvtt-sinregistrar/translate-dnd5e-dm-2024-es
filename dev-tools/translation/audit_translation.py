"""Audit every translation leaf against original human-readable fields."""
from reuse_verified import ROOT, DATA, load, save, fields, technical, numbers

def leaves(value, prefix=()):
    if isinstance(value, dict):
        for key, child in value.items(): yield from leaves(child, prefix+(key,))
    else: yield prefix, value

def audit():
    report = {'errors': [], 'numberReview': [], 'coverage': {}, 'pending': []}
    sources = sorted(DATA.glob('*.en.json'))
    expected = {f'dnd-dungeon-masters-guide.{pack}.en.json' for pack in ('actors','bastions','content','equipment','features','scenes','tables')}
    if {p.name for p in sources} != expected:
        report['errors'].append('Expected all seven original exports; coverage cannot be certified')
    for source in sources:
        original = load(source)
        translated = load(ROOT/'compendium'/source.name.replace('.en.json','.json'))
        docs = {d['_id']:d for d in original['documents']}
        count = total = 0
        for id, entry in translated['entries'].items():
            if id not in docs: report['errors'].append(f'Unknown document {source.name}:{id}'); continue
            allowed = dict(fields(docs[id], original['documentType']))
            for path, text in leaves(entry):
                address = original['collection']+'.'+id+'.'+'.'.join(path)
                if path not in allowed:
                    report['errors'].append('Unknown or non-text field '+address); continue
                if not isinstance(text, str): report['errors'].append('Non-string '+address); continue
                if technical(text) != technical(allowed[path]): report['errors'].append('Changed reference or formula '+address)
                if numbers(text) != numbers(allowed[path]): report['numberReview'].append(address)
        for id, doc in docs.items():
            patch = dict(leaves(translated['entries'].get(id, {})))
            for path, english in fields(doc, original['documentType']):
                if not english.strip(): continue
                total += 1
                if path in patch: count += 1
                else: report['pending'].append({'pack': original['collection'], 'id': id, 'path': list(path), 'english': english})
        report['coverage'][original['collection']] = {'documents': len(docs), 'entries': len(translated['entries']), 'textFields': total, 'translatedFields': count}
    save(DATA/'translation-audit.json', report)
    print('Errors:',len(report['errors']),'numeric review:',len(report['numberReview']),'pending fields:',len(report['pending']))
    for error in report['errors'][:25]:print(error)
    print(report['coverage'])
    return report

if __name__ == '__main__':
    result = audit()
    raise SystemExit(bool(result['errors'] or result['numberReview'] or result['pending']))
