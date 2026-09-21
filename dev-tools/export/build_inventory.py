"""Verify locally exported packs and write a content-free inventory report."""
import hashlib
import json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'dev-tools/export/data'


def build():
    inventory = json.loads((DATA/'dmg-export-inventory.json').read_text(encoding='utf-8'))
    assert len(inventory['packs']) == 7
    report = ['# Inventario de fuentes DMG 2024', '',
              f"Extracción: {inventory['exportedAt']}. Foundry {inventory['foundry']}; dnd5e {inventory['system']['version']}; módulo oficial {inventory['source']['version']}.", '',
              'Los siete archivos originales se conservan localmente en `export/data/`, fuera de Git. SHA-256 verificados. Babele estaba activo, pero el exportador rechazó packs traducidos y marcas de traducción, incluidos documentos anidados.', '',
              '| Pack | Documentos | Carpetas | Páginas | Actividades | Efectos | Avances | Objetos anidados | Resultados |',
              '|---|---:|---:|---:|---:|---:|---:|---:|---:|']
    total = 0
    for pack in inventory['packs']:
        path = DATA/pack['filename']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == pack['sha256'], path
        source = json.loads(path.read_text(encoding='utf-8'))
        assert len(source['documents']) == pack['documents']
        assert len({d['_id'] for d in source['documents']}) == pack['documents']
        # Older inventory schema counted activity effect references as documents.
        def effect_count(doc):
            return len(doc.get('effects', [])) + sum(effect_count(item) for item in doc.get('items', []))
        pack['effects'] = sum(effect_count(doc) for doc in source['documents'])
        total += pack['documents']
        report.append('| '+ ' | '.join(str(pack[k]) for k in ['collection','documents','folders','pages','activities','effects','advancement','items','results'])+' |')
    report += ['', f'Total: **{total} documentos principales**.', '', '## Hallazgos de esquema', '',
               '- Los resultados de RollTable de Foundry 14 usan `description` y `name`; no se deben generar parches con el antiguo campo `text`.',
               '- Las actividades usan `activation.condition` y `description.chatFlavor`; los parches deben respetar esa estructura.',
               '- Los avances pueden ser diccionarios por ID. El convertidor admite diccionarios y listas.',
               '- Los bastiones son Item de tipo `facility`. El texto de reglas está en `system.description.value`; `order`, `size`, `type.subtype`, cantidades y progreso son datos mecánicos o claves del sistema, no texto para traducir.',
               '- Algunas instalaciones básicas insertan páginas con `@Embed`: también habrá que traducir el diario de destino.',
               '- Este inventario acredita extracción y estructura, no traducción completa ni validación de todas las mecánicas del módulo oficial.', '']
    out = ROOT/'dev-tools/translation/INVENTARIO.md'
    out.write_text('\n'.join(report), encoding='utf-8')
    print(f'Validated seven SHA-256 digests; {total} documents. Report: {out}')


if __name__ == '__main__':
    build()
