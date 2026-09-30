# Estado de la traducción — actualización 2026-09-30

Se han generado los siete ficheros de Babele para los 873 documentos de DMG
2.0.0. La cobertura estructural es completa; **la revisión lingüística del
libro completo sigue pendiente**. No publicar este borrador como traducción
final ni interpretar la presencia de un campo como certificación de calidad.

## Cobertura

| Compendio | Documentos | Campos de texto cubiertos | Revisión |
|---|---:|---:|---|
| Rasgos | 23 | 48 | Revisados con la referencia española |
| Bastiones | 35 | 89 | Revisados; incluye la página de instalaciones básicas |
| Equipo | 548 | 2449 | Cotejo completo de los 2449 campos, incluidas 539 descripciones; contraste terminológico selectivo con el OCR español |
| Tablas | 125 | 1738 | Revisadas contra el original; contraste español selectivo, nombres y limitaciones documentados |
| Actores | 72 | 606 | Revisados contra el original; contraste terminológico selectivo con el OCR español |
| Contenido | 46 | 949 | Borrador de 473 páginas; 923 campos cotejados, revisión parcial |
| Escenas | 24 | 142 | Textos revisados; no incluye texto incrustado en imágenes |
| **Total** | **873** | **6021** | **Cobertura estructural, no aprobación lingüística** |

El recuento incluye nombres propios sin cambios y campos que solo contienen
referencias técnicas. Se traducen también carpetas, etiquetas de enlaces,
actividades, efectos, objetos anidados, notas y regiones cuando existen.
No se traduce texto incrustado en las ilustraciones ni se sustituyen sus recursos.

En el lote del 30 de septiembre se revisaron las 18 filas siguientes, índices
794–811, del diario *Running Exploration*. Se corrigieron 14 campos; cuatro
títulos ya eran adecuados. La cobertura registrada asciende a **882/949 campos**,
308 textos de página y **41 diarios completos**. La revisión es editorial y
selectiva; no certifica el resto del libro.

Después se revisaron seis campos, índices 812–817, de *Running Social
Interaction*. Se corrigieron los tres párrafos; los tres títulos ya eran
adecuados. La cobertura registrada asciende a **888/949 campos**, 311 textos
de página y **42 diarios completos**.

El lote siguiente cotejó 18 campos, índices 818–835, de *Running the Game*. Se
corrigieron 11 textos y siete títulos ya eran adecuados. La cobertura alcanza
**906/949 campos**, 320 textos de página y **43 diarios completos**. Se
contrastaron los pasajes con el original y el OCR español selectivo (páginas
impresas 20–26); la revisión del libro sigue parcial.

El primer sublote de *The Basics* revisó los índices 836–839: el título del
diario se aplica también a su primera página. Se corrigieron cinco destinos
(dos correspondientes a la misma fuente) y la cobertura alcanza **911/949
campos**, 324 textos de página y **43 diarios completos**. Los diarios largos
restantes del capítulo siguen pendientes de cotejo editorial.

El segundo sublote de *The Basics* revisó los índices 841–846 y 848–851.
Se corrigieron seis destinos y se validaron los restantes, incluido el embed
final. El cierre del lote completó los textos extensos 840 y 847: recursos para
el DM, diálogo de ejemplo, anotaciones y regla de la diversión. La cobertura
registrada asciende a **923/949 campos** y 852 textos fuente únicos. El diario
*The Basics* queda revisado; la revisión del libro sigue parcial.

## Revisión de diarios — 30 de septiembre de 2026

El registro de textos revisados cubre **864 de 949 campos** (794 textos fuente
únicos), incluidos **299 campos de página** y **40 diarios completos**. En este
lote se revisaron 39 campos de *Resolving Outcomes* y *Running Combat*, índices
755–793 de la instantánea local. Esta cobertura mide cotejo registrado; el
contenido sigue en revisión y la validación de Foundry de las 10:16:12 UTC del
29 de septiembre precede a estos cambios.

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
- Un enlace original requería importar su diario al mundo:
  `equipment.dmgSanctuaryChar` →
  `JournalEntry.dmgDmsToolbox000.JournalEntryPage.U9qU1oUFTPAK7g50`.
  El 28 de septiembre de 2026 se comprobó en el mundo limpio `testing` que
  **Importar** el capítulo **Herramientas de DM** desde su ficha oficial conserva
  el ID y resuelve el enlace. Se abrió el destino desde el objeto. Se conserva
  la referencia de la fuente; véase [ENLACE-SANTUARIO.md](ENLACE-SANTUARIO.md).

Una auditoría numérica no detecta inversiones de significado, omisiones de
palabras ni terminología incorrecta. La validación de campos tampoco reemplaza
la prueba funcional de cada actividad, tirada, bastión o aventura.

### Ampliación funcional — 2026-09-28

En el mundo `testing` se comprobaron 3468 referencias sin destinos pendientes,
3 diarios importados (28 páginas, 1806 enlaces enriquecidos y 15 imágenes),
125 tablas y una muestra de 6 objetos en dos actores QA (original y traducido).
Las 12 comprobaciones de objetos pasaron. Se ejecutaron tiradas en 5 tablas;
la ausencia de filas 8–12 en `dmgWildernessCha` ya existe en DMG 2.0.0.
Los detalles y las funciones no cubiertas constan en
[VALIDACION-FUNCIONAL.md](VALIDACION-FUNCIONAL.md). No se modifica la evaluación
lingüística ni se certifican todas las automatizaciones del libro.

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

Los lotes del 29 de septiembre corrigen 424 etiquetas de equipo y escenas y
revisan seis descripciones completas con el OCR español. Incluyen el nombre
oficial Daga de la ponzoña y sus etiquetas de enlaces: 434 campos cambiados,
conservando cifras y referencias. Véase
[REVISION-LINGUISTICA.md](REVISION-LINGUISTICA.md). No sustituye la revisión
de las descripciones y párrafos completos que se detalla a continuación.

- Actores y escenas: segundo lote revisado, 262 campos corregidos; alcance y
  método en el informe lingüístico. Queda la concordancia con menciones en otros compendios.
- Tablas: revisados los 1738 campos; tercer lote de 832 correcciones, incluidas
  concordancias de nombres en equipo y diarios. Se documenta un UUID equivocado
  del original en Reliquias muy raras, además del rango ausente ya conocido.
- Equipo: cotejo completo registrado por fuente y documento; se conservan las
  cifras y mecánicas originales. El OCR distingue enredadera afilada de
  enredadera feroz; se corrige la confusión introducida en el lote anterior.
- Revisar los diarios por lotes contra el texto español;
  atender a negaciones, condiciones, duración, nombres propios y frases cortadas.
- Unificar los nombres citados en párrafos con los nombres finales de entradas.
- Revisar inglés residual en HTML, atributos visibles y títulos; distinguirlo de
  identificadores, fórmulas, marcas, nombres propios y palabras válidas en español.
- Escenas y bastiones ampliados: véase [VALIDACION-CIERRE.md](VALIDACION-CIERRE.md).
  El clon aislado y su ZIP extraído pasan; queda instalación/actualización por
  la interfaz de Foundry y la sesión real de jugador. El enlace de mundo ya está documentado
  y su destino se comprobó tras importar el capítulo 3.
- Preparar publicación y URLs de descarga solo cuando cierre la revisión.

**Discrepancia de la fuente:** la descripción de `dmgFirePotionOfG` indica
Fuerza 23, mientras que la tabla general de pociones de fuerza de gigante
indica 25 y el efecto `Men77BWldNXaCmrA` aplica 25 a
`system.abilities.str.value`. Los tres valores ya están así en DMG 2.0.0.
Se conservan las cifras del original y el efecto; al usar esta poción, tener
en cuenta que su descripción individual discrepa de la tabla y la automatización.
