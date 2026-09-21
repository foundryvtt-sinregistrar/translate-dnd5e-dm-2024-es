# Inventario de fuentes DMG 2024

Extracción: 2026-09-21T22:32:20.797Z. Foundry 14.368; dnd5e 6.0.3; módulo oficial 2.0.0.

Los siete archivos originales se conservan localmente en `export/data/`, fuera de Git. SHA-256 verificados. Babele estaba activo, pero el exportador rechazó packs traducidos y marcas de traducción, incluidos documentos anidados.

| Pack | Documentos | Carpetas | Páginas | Actividades | Efectos | Avances | Objetos anidados | Resultados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| dnd-dungeon-masters-guide.content | 46 | 9 | 473 | 0 | 0 | 0 | 0 | 0 |
| dnd-dungeon-masters-guide.equipment | 548 | 37 | 0 | 936 | 735 | 0 | 0 | 0 |
| dnd-dungeon-masters-guide.features | 23 | 1 | 0 | 5 | 0 | 0 | 0 | 0 |
| dnd-dungeon-masters-guide.bastions | 35 | 2 | 0 | 11 | 12 | 0 | 0 | 0 |
| dnd-dungeon-masters-guide.tables | 125 | 29 | 0 | 0 | 0 | 0 | 0 | 1599 |
| dnd-dungeon-masters-guide.actors | 72 | 5 | 0 | 143 | 53 | 0 | 116 | 0 |
| dnd-dungeon-masters-guide.scenes | 24 | 4 | 0 | 0 | 0 | 0 | 0 | 0 |

Total: **873 documentos principales**.

## Hallazgos de esquema

- Los resultados de RollTable de Foundry 14 usan `description` y `name`; no se deben generar parches con el antiguo campo `text`.
- Las actividades usan `activation.condition` y `description.chatFlavor`; los parches deben respetar esa estructura.
- Los avances pueden ser diccionarios por ID. El convertidor admite diccionarios y listas.
- Los bastiones son Item de tipo `facility`. El texto de reglas está en `system.description.value`; `order`, `size`, `type.subtype`, cantidades y progreso son datos mecánicos o claves del sistema, no texto para traducir.
- Algunas instalaciones básicas insertan páginas con `@Embed`: también habrá que traducir el diario de destino.
- Este inventario acredita extracción y estructura, no traducción completa ni validación de todas las mecánicas del módulo oficial.
