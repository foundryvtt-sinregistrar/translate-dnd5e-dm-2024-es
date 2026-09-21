# Estado de la traducción — 2026-09-22

Se han generado los siete ficheros de Babele para los 873 documentos de DMG
2.0.0. La cobertura estructural es completa; **la revisión lingüística del
libro completo sigue pendiente**. No publicar este borrador como traducción
final ni interpretar la presencia de un campo como certificación de calidad.

## Cobertura

| Compendio | Documentos | Campos de texto cubiertos | Revisión |
|---|---:|---:|---|
| Rasgos | 23 | 48 | Revisados con la referencia española |
| Bastiones | 35 | 89 | Revisados; incluye la página de instalaciones básicas |
| Equipo | 548 | 2449 | Reutilización y borrador automático con correcciones parciales |
| Tablas | 125 | 1738 | Borrador; piloto y tablas vinculadas de bastiones revisados |
| Actores | 72 | 606 | Reutilización y borrador con correcciones de nombres |
| Contenido | 46 | 949 | Borrador de 473 páginas; revisión parcial |
| Escenas | 24 | 142 | Borrador con correcciones de nombres y etiquetas |
| **Total** | **873** | **6021** | **Cobertura estructural, no aprobación lingüística** |

El recuento incluye nombres propios sin cambios y campos que solo contienen
referencias técnicas. Se traducen también carpetas, etiquetas de enlaces,
actividades, efectos, objetos anidados, notas y regiones cuando existen.
No se traduce texto incrustado en las ilustraciones ni se sustituyen sus recursos.

## Procedencia y generación

1. Fuentes inglesas exportadas mediante la API de Foundry y sin traducción Babele
   aplicada. PDF español y OCR local como referencia para glosario y revisión.
2. Reutilización de 906 campos inicialmente coincidentes con los originales de
   SRD y MM traducidos. Se exige coincidencia del texto inglés, no solo del nombre;
   los UUID se adaptan al documento de destino conservando sus referencias.
   Las coincidencias ambiguas se excluyen. Se corrigen además etiquetas inglesas
   heredadas de las referencias.
3. Generación del resto con OPUS-MT inglés-español y CTranslate2 en CPU local.
   Los textos no se enviaron a un servicio externo. El motor puede producir
   traducciones literales, nombres incorrectos y errores semánticos.
4. Correcciones parciales en `reviewed-segments.json`, glosario y JSON finales:
   nombres de objetos, rasgos, bastiones, escenas, etiquetas, cifras y términos
   que el modelo confundía. Estas correcciones no equivalen a revisar el libro.

Modelo: [Helsinki-NLP, eng-spa opus-2021-02-19](https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-spa).
Conversión: [CTranslate2 / OPUS-MT](https://opennmt.net/CTranslate2/guides/opus_mt.html).
SHA-256 del ZIP usado:
`f76bd91280deb275a36ccee61c1069e7808badd3e19ac73f0def08f18aaf896d`.

`dev-tools/export/data/mt-provenance.json` registra los campos generados y sus
huellas; `mt-segments.jsonl` conserva la caché. Ambos, los originales y el OCR
están excluidos de Git. Conservarlos para futuras sesiones. Los informes de
generación históricos no son un recuento actualizado de revisión humana.

## Validación técnica

- Auditoría sobre los originales: cero campos no cubiertos, cero alteraciones
  detectadas de referencias o fórmulas y cero diferencias numéricas pendientes.
- 25 pruebas Node: registro, convertidores, referencias y conservación de datos
  mecánicos. Siete pruebas usan las exportaciones locales y se omiten si faltan;
  en esta ejecución estaban presentes y no se omitió ninguna.
- Foundry 14.368, dnd5e 6.0.3, Babele 2.9.1: índices y textos de los 873 documentos
  comprobados contra los JSON. Incluye documentos anidados y enlaces relativos.
- La comprobación completa no importa 873 documentos al mundo. Las siete
  importaciones del piloto anterior se conservan como muestra histórica.
- Un enlace original no se resuelve en este mundo:
  `equipment.dmgSanctuaryChar` →
  `JournalEntry.dmgDmsToolbox000.JournalEntryPage.U9qU1oUFTPAK7g50`.
  Apunta a un diario del mundo; se conserva sin cambiar el destino de la fuente.

Una auditoría numérica no detecta inversiones de significado, omisiones de
palabras ni terminología incorrecta. La validación de campos tampoco reemplaza
la prueba funcional de cada actividad, tirada, bastión o aventura.

## Reproducción

Desde la raíz del módulo, con las exportaciones locales conservadas:

```sh
python dev-tools/export/build_inventory.py
python dev-tools/translation/audit_translation.py
node --test tests/*.test.mjs
```

Para generar nuevos campos (no hace falta regenerar los existentes):

```sh
python -m pip install --target tmp/translation-runtime ctranslate2==4.8.2 sentencepiece==0.2.2 sacremoses pyyaml
python dev-tools/translation/prepare_local_mt.py
python dev-tools/translation/generate_draft.py
```

El generador protege HTML, referencias y fórmulas antes de traducir segmentos.
`--refresh` solo actualiza campos de procedencia automática con la misma fuente
y sin cambios manuales posteriores; no usar sin conservar la procedencia y
revisar el diff. Las cifras discrepantes se registran para revisión, no se
deben corregir por posición automáticamente.

Macro de tipo Script, como GM, tras recargar el mundo con la traducción activa:

```js
const {validatePilot} = await import(
  '/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/validate-pilot.mjs'
);
await validatePilot({allEntries: true, importDocuments: false});
```

Resultado local: `dev-tools/export/data/dmg-translation-validation.json`.

## Trabajo pendiente antes de publicar

- Revisar equipo, actores, tablas y diario por lotes contra el texto español;
  atender a negaciones, condiciones, duración, nombres propios y frases cortadas.
- Unificar los nombres citados en párrafos con los nombres finales de entradas.
- Revisar inglés residual en HTML, atributos visibles y títulos; distinguirlo de
  identificadores, fórmulas, marcas, nombres propios y palabras válidas en español.
- Revisar visualmente escenas y páginas, probar funciones representativas e
  instalación limpia. Resolver o documentar la dependencia del enlace de mundo.
- Preparar publicación y URLs de descarga solo cuando cierre la revisión.
