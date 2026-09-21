"""Reuse local bilingual fields only when their original English text matches.

No network calls. References retain the destination compendium's UUIDs.
Existing reviewed translations always win. Unmatched fields remain pending.
"""
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'dev-tools/export/data'
UUID = re.compile(r'Compendium\.[^.\s\]]+\.[^.\s\]]+\.[^\]\s]+')
TECH = re.compile(r'@(?:UUID|Embed)\[[^\]]+\]|\[\[[\s\S]*?\]\]|&(?:amp;)?[Rr]eference\[[^\]]+\]')
def technical(text):
    return sorted(re.sub(r'\s+#\s+[^\]]+(?=\]\]$)', '', x) for x in TECH.findall(text))
def numbers(text):
    text = re.sub(r'<[^>]+>', ' ', TECH.sub(' ', text))
    text = re.sub(r'\b\d{1,3}(?:[,.]\d{3})+\b', lambda m:re.sub('[,.]', '', m[0]), text)
    return sorted(re.findall(r'\d+', text))
def canonical_uuid(s):
    return re.sub(r'^Compendium\.[^.]+\.[^.]+\.', 'Compendium.*.', s)
def normalize(s):
    s = UUID.sub(lambda m: canonical_uuid(m[0]), s)
    return re.sub(r'\s+', ' ', s.strip()).replace('’', "'")
def adapt(source, translated):
    destinations = {canonical_uuid(m[0]): m[0] for m in UUID.finditer(source)}
    for m in UUID.finditer(translated):
        if canonical_uuid(m[0]) not in destinations: return None
    result = UUID.sub(lambda m: destinations[canonical_uuid(m[0])], translated)
    if technical(source) != technical(result) or numbers(source) != numbers(result): return None
    return result
def fields(doc, kind, prefix=()):
    def emit(path, value):
        if isinstance(value, str): return [(prefix + path, value)]
        return []
    out = emit(('name',), doc.get('name'))
    system = doc.get('system', {})
    if kind == 'Item':
        out += emit(('requirements',), system.get('requirements'))
        out += emit(('description',), system.get('description', {}).get('value'))
        out += emit(('descriptionChat',), system.get('description', {}).get('chat'))
        out += emit(('unidentifiedDescription',), system.get('unidentified', {}).get('description'))
        for aid, activity in system.get('activities', {}).items():
            out += emit(('activities', aid, 'name'), activity.get('name'))
            for group, keys in {'activation': ['condition'], 'description': ['chatFlavor', 'value'], 'range': ['special'], 'roll': ['name']}.items():
                for key in keys: out += emit(('activities', aid, group, key), get(activity, (group, key)))
            out += emit(('activities', aid, 'target', 'affects', 'special'), get(activity, ('target', 'affects', 'special')))
    if kind == 'Actor':
        for field,path in {'alignment':('details','alignment'), 'creatureType':('details','type','custom'), 'creatureSubtype':('details','type','subtype'), 'languages':('traits','languages','custom'), 'senses':('attributes','senses','special'), 'biographyPublic':('details','biography','public')}.items():
            out += emit((field,), get(system,path))
        out += emit(('tokenName',), doc.get('prototypeToken', {}).get('name'))
        out += emit(('biography',), system.get('details', {}).get('biography', {}).get('value'))
        for item in doc.get('items', []): out += fields(item, 'Item', prefix + ('items', item['_id']))
    if kind == 'JournalEntry':
        for page in doc.get('pages', []):
            out += emit(('pages', page['_id'], 'name'), page.get('name'))
            out += emit(('pages', page['_id'], 'text'), page.get('text', {}).get('content'))
            out += emit(('pages', page['_id'], 'image', 'caption'), page.get('image', {}).get('caption'))
    if kind == 'RollTable':
        out += emit(('description',), doc.get('description'))
        for result in doc.get('results', []):
            for key in ['name', 'description']: out += emit(('results', result['_id'], key), result.get(key))
    if kind == 'Scene':
        out += emit(('navigation',), doc.get('navName'))
        for group, key in [('notes', 'text'), ('drawings', 'text'), ('tokens', 'name'), ('regions', 'name')]:
            for child in doc.get(group, []): out += emit((group, child['_id'], key), child.get(key))
    for effect in doc.get('effects', []):
        for key in ['name', 'description']: out += emit(('effects', effect['_id'], key), effect.get(key))
    return out
def get(obj, path):
    for key in path:
        if not isinstance(obj, dict): return None
        obj = obj.get(key)
    return obj
def put(obj, path, value):
    for key in path[:-1]: obj = obj.setdefault(key, {})
    obj[path[-1]] = value
def load(path): return json.loads(path.read_text(encoding='utf8'))
def save(path, value): path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf8')

def main():
    memory = defaultdict(dict)
    for path in sorted(DATA.glob('*.reference.json')):
        source = load(path)
        name = source['collection'].rsplit('.', 1)[1]
        kind = {'equipment24':'Item', 'content24':'JournalEntry', 'tables24':'RollTable', 'actors24':'Actor', 'actors':'Actor'}[name]
        for pair in source['documents']:
            translated = dict(fields(pair['translated'], kind))
            for key, english in fields(pair['original'], kind):
                spanish = translated.get(key)
                if english.strip() and spanish and normalize(english) != normalize(spanish):
                    memory[normalize(english)][spanish] = source['collection']
    report = {'reused': [], 'ambiguous': [], 'pending': []}
    for path in sorted(DATA.glob('*.en.json')):
        data = load(path); kind = data['documentType']
        output = ROOT / 'compendium' / path.name.replace('.en.json', '.json')
        translation = load(output)
        for doc in data['documents']:
            entry = translation['entries'].setdefault(doc['_id'], {})
            for key, english in fields(doc, kind):
                if not english.strip(): continue
                if get(entry, key) is not None: continue
                candidates = memory.get(normalize(english), {})
                adapted = {}
                for text, collection in candidates.items():
                    text = adapt(english, text)
                    if text is not None: adapted[text] = collection
                address = f"{data['collection']}.{doc['_id']}." + '.'.join(key)
                if len(adapted) == 1:
                    text, collection = next(iter(adapted.items()))
                    put(entry, key, text)
                    report['reused'].append({'field': address, 'source': collection})
                elif adapted: report['ambiguous'].append(address)
                else: report['pending'].append({'field': address, 'english': english})
            if not entry: del translation['entries'][doc['_id']]
        save(output, translation)
    save(DATA / 'reuse-report.json', report)
    print({key:len(value) for key,value in report.items()})

if __name__ == '__main__': main()
