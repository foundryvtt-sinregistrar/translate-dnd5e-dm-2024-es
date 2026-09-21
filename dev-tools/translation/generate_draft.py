"""Complete missing text fields with cached, offline English-Spanish drafts.

Markup and Foundry syntax are parsed out before translation and reassembled
verbatim. Existing translations are never replaced. Draft provenance is saved
separately from Babele runtime data. This is NOT a linguistic approval step.
"""
import argparse
import hashlib
import html
import json
import re
import sys
import time
from pathlib import Path
from reuse_verified import ROOT, DATA, load, save, get, put, fields, numbers, technical

sys.path.insert(0, str(ROOT/'tmp/translation-runtime'))

MODEL = ROOT/'tmp/opus-en-es'
CACHE = DATA/'mt-segments.jsonl'
PROVENANCE = DATA/'mt-provenance.json'
# Includes lower-case reference in the official source.
TOKEN = re.compile(r'(<[^>]+>|@(?:UUID|Embed)\[[^\]]+\](?:\{[^}]*\})?|\[\[[\s\S]*?\]\](?:\{[^}]*\})?|&(?:amp;)?[Rr]eference\[[^\]]+\](?:\{[^}]*\})?|https?://[^\s<>]+)')
TERMS = {
 'Dungeon Master': 'Dungeon Master', 'Dungeon Master’s Guide': 'Guía del Dungeon Master',
 'Player’s Handbook': 'Manual del jugador', "Player's Handbook": 'Manual del jugador',
 'Monster Manual': 'Manual de monstruos', 'Foundry Note': 'Nota de Foundry', 'Foundry Notes': 'Notas de Foundry',
 'Armor Class': 'Clase de Armadura', 'Hit Points': 'puntos de golpe', 'Temporary Hit Points': 'puntos de golpe temporales',
 'Strength': 'Fuerza', 'Dexterity': 'Destreza', 'Constitution': 'Constitución', 'Intelligence': 'Inteligencia', 'Wisdom': 'Sabiduría', 'Charisma': 'Carisma',
 'Advantage': 'ventaja', 'Disadvantage': 'desventaja', 'Bonus Action': 'acción adicional', 'Long Rest': 'descanso largo', 'Short Rest': 'descanso corto',
 'Saving Throw': 'tirada de salvación', 'Saving Throws': 'tiradas de salvación', 'saving throw': 'tirada de salvación',
 'Attunement': 'sintonización', 'Requires Attunement': 'Requiere sintonización', 'Wondrous Item': 'Objeto maravilloso',
 'Very Rare': 'Muy raro', 'Uncommon': 'Infrecuente', 'Common': 'Común', 'Rare': 'Raro', 'Legendary': 'Legendario',
 'Spell Scroll': 'Pergamino de conjuro', 'Spellcasting': 'Lanzamiento de conjuros', 'Spellcasting Focus': 'canalizador de conjuros',
 'Arcane Focus': 'canalizador arcano', 'Bastion': 'bastión', 'Bastions': 'Bastiones', 'Bastion Defender': 'defensor del bastión',
 'Bastion Defenders': 'defensores del bastión', 'Craft': 'Fabricación', 'Research': 'Investigación', 'Recruit': 'Reclutamiento',
 'Harvest': 'Cosecha', 'Empower': 'Potenciación', 'Trade': 'Comercio', 'Special': 'Especiales', 'Basic': 'Básicas',
 'North': 'Norte', 'South': 'Sur', 'East': 'Este', 'West': 'Oeste', 'None': 'Ninguno', 'Description': 'Descripción',
 'Melee Attack Roll': 'Tirada de ataque cuerpo a cuerpo', 'Ranged Attack Roll': 'Tirada de ataque a distancia',
 'Hit': 'Impacto', 'Miss': 'Fallo', 'Failure': 'Fallo', 'Success': 'Éxito', 'First Failure': 'Primer fallo',
 'Opportunity Attack': 'ataque de oportunidad', 'Opportunity Attacks': 'ataques de oportunidad',
 'Difficult Terrain': 'terreno difícil', 'Heroic Inspiration': 'inspiración heroica', 'Proficiency Bonus': 'bonificador por competencia',
 'D20 Test': 'prueba de d20', 'D20 Tests': 'pruebas de d20', 'Foundry Virtual Tabletop': 'Foundry Virtual Tabletop',
 'Dungeons & Dragons': 'Dungeons & Dragons', 'D&D': 'D&D', 'DM': 'DM', 'GP': 'po', 'SP': 'pp', 'CP': 'pc', 'PP': 'ppt', 'EP': 'pe',
 'DC': 'CD', 'AC': 'CA', 'HP': 'PG', 'NPC': 'PNJ', 'NPCs': 'PNJ', 'XP': 'PX', 'FT': 'pies',
}
def key(text): return hashlib.sha256(text.encode()).hexdigest()
def terminology(source, translated):
    replacements = {
      'acción de bonificación':'acción adicional', 'Acción de bonificación':'Acción adicional',
      'ranura de hechizo':'espacio de conjuro', 'ranuras de hechizo':'espacios de conjuro',
      'ranuras de hechizos':'espacios de conjuro', 'ranura de conjuro':'espacio de conjuro',
      'hechizos':'conjuros', 'hechizo':'conjuro', 'Hechizos':'Conjuros', 'Hechizo':'Conjuro',
      'tiro de salvación':'tirada de salvación', 'tiros de salvación':'tiradas de salvación',
      'tiro de ahorro':'tirada de salvación', 'tiros de ahorro':'tiradas de salvación',
    }
    for before,after in sorted(replacements.items(),key=lambda x:-len(x[0])):translated=translated.replace(before,after)
    if re.search(r'\bplanes?\b',source,re.I):
        translated=re.sub(r'\baviones\b','planos',translated,flags=re.I)
        translated=re.sub(r'\bavión\b','plano',translated,flags=re.I)
    for before,after in {'GP':'po','SP':'pp','CP':'pc','EP':'pe','PP':'ppt','DC':'CD','HP':'PG','NPC':'PNJ','NPCs':'PNJ','XP':'PX'}.items():
        translated=re.sub(r'\b'+before+r'\b',after,translated)
    return translated
def chunks(text):
    # Split long prose at sentence boundaries before model tokenization.
    for part in re.split(r'(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ])', text):
        words = part.split(' ')
        while len(words)>85:
            yield ' '.join(words[:85]); words=words[85:]
        if words: yield ' '.join(words)
def pieces(text):
    for token in TOKEN.split(text):
        if not token: continue
        if TOKEN.fullmatch(token):
            # Link captions and roll labels are display text, not technical syntax.
            match = re.fullmatch(r'(.*\])\{([^}]*)\}', token, re.S)
            if match:
                yield ('literal', match[1]+'{'); yield from pieces(match[2]); yield ('literal', '}')
            elif token.startswith('[[') and ' # ' in token:
                head, label = token[:-2].split(' # ',1)
                yield ('literal', head+' # '); yield from pieces(label); yield ('literal', ']]')
            else: yield ('literal', token)
        else:
            leading = token[:len(token)-len(token.lstrip())]; trailing = token[len(token.rstrip()):]
            if leading: yield ('literal', leading)
            core = html.unescape(token.strip())
            for i, chunk in enumerate(chunks(core)):
                if i: yield ('literal',' ')
                if chunk: yield ('text',chunk)
            if trailing and core: yield ('literal',trailing)
def main():
    import ctranslate2
    import sentencepiece
    parser=argparse.ArgumentParser(); parser.add_argument('--limit',type=int); parser.add_argument('--refresh',action='store_true'); args=parser.parse_args()
    cache={}
    if CACHE.exists():
        for line in CACHE.read_text(encoding='utf8').splitlines():
            row=json.loads(line);cache[row['source']]=row['translation']
    jobs=[]; unique=set(); provenance=load(PROVENANCE) if PROVENANCE.exists() else {'engine':'OPUS-MT eng-spa opus-2021-02-19 / CTranslate2 int8 CPU', 'fields':{},'review':[]}
    packs={}
    for p in sorted(DATA.glob('*.en.json')):
        source=load(p); target=ROOT/'compendium'/p.name.replace('.en.json','.json'); translated=load(target)
        packs[source['collection']]=(target,translated)
        for doc in source['documents']:
            entry=translated['entries'].setdefault(doc['_id'],{})
            for path, english in fields(doc,source['documentType']):
                address=source['collection']+'.'+doc['_id']+'.'+'.'.join(path)
                previous=provenance['fields'].get(address)
                refresh=args.refresh and previous and previous.get('sourceSha256')==key(english) and (not previous.get('translationSha256') or previous['translationSha256']==key(get(entry,path) or ''))
                if not english.strip() or (get(entry,path) is not None and not refresh): continue
                segments=list(pieces(english))
                jobs.append((source['collection'],doc['_id'],path,english,segments))
                unique.update(value for kind,value in segments if kind=='text' and re.search('[A-Za-z]',value))
        for folder in source.get('folders',[]):
            if folder['name'] not in translated['folders']:
                segments=list(pieces(folder['name']));jobs.append((source['collection'],None,('folders',folder['name']),folder['name'],segments))
                unique.update(value for kind,value in segments if kind=='text' and re.search('[A-Za-z]',value))
    # Names already reviewed in this project override standalone model headings.
    for p in sorted(DATA.glob('*.en.json')):
        source=load(p);trans=packs[source['collection']][1]
        for doc in source['documents']:
            name=trans['entries'].get(doc['_id'],{}).get('name')
            if name and source['collection']+'.'+doc['_id']+'.name' not in provenance['fields']: TERMS.setdefault(doc['name'],name)
    cache.update(TERMS)
    reviewed=ROOT/'dev-tools/translation/reviewed-segments.json'
    if reviewed.exists(): cache.update(load(reviewed))
    todo=sorted((x for x in unique if x not in cache),key=len)
    if args.limit:todo=todo[:args.limit]
    print(f'{len(jobs)} pending fields; {len(todo)} uncached segments',flush=True)
    source_sp=sentencepiece.SentencePieceProcessor(model_file=str(MODEL/'source.spm'))
    target_sp=sentencepiece.SentencePieceProcessor(model_file=str(MODEL/'target.spm'))
    translator=ctranslate2.Translator(str(MODEL/'ct2'),device='cpu',compute_type='int8',inter_threads=2,intra_threads=4)
    started=time.monotonic()
    with CACHE.open('a',encoding='utf8') as output:
        for start in range(0,len(todo),64):
            batch=todo[start:start+64]
            tokens=[source_sp.encode(x,out_type=str) for x in batch]
            results=translator.translate_batch(tokens,beam_size=2,max_batch_size=64,max_input_length=512,max_decoding_length=512)
            for english,result in zip(batch,results):
                spanish=target_sp.decode(result.hypotheses[0])
                # Numeric mismatches are preserved in a review queue, not silently accepted.
                if numbers(english)!=numbers(spanish):
                    provenance['review'].append({'source':english,'translation':spanish,'reason':'numbers'})
                cache[english]=spanish
                output.write(json.dumps({'source':english,'translation':spanish},ensure_ascii=False)+'\n')
            output.flush()
            print(f'{min(start+64,len(todo))}/{len(todo)} segments, {time.monotonic()-started:.0f}s',flush=True)
            save(PROVENANCE,provenance)
    complete=0
    for collection,id,path,english,segments in jobs:
        if any(kind=='text' and re.search('[A-Za-z]',value) and value not in cache for kind,value in segments):continue
        spanish=''.join(value if kind=='literal' else html.escape(terminology(value,cache.get(value,value)),quote=False) for kind,value in segments)
        if technical(english)!=technical(spanish): raise ValueError('Changed technical syntax '+collection+str(path))
        translated=packs[collection][1]
        put(translated['entries'][id] if id else translated,path,spanish)
        provenance['fields'][collection+'.'+str(id)+'.'+'.'.join(path)]={'method':'local-mt-draft','sourceSha256':key(english),'translationSha256':key(spanish)}
        complete+=1
    for target,translated in packs.values():save(target,translated)
    save(PROVENANCE,provenance)
    print(f'Saved {complete} draft fields. Linguistic review required.',flush=True)
if __name__=='__main__':main()
