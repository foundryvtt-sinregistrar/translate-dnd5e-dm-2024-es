# Revisión lingüística por lotes

## Lote de etiquetas — 29 de septiembre de 2026

Comparación de etiquetas de actividades, efectos y navegación con los campos
ingleses exportados de DMG 2.0.0. Se han corregido **424 campos**:

| Compendio | Campos corregidos | Documentos afectados |
| --- | ---: | ---: |
| Equipo | 395 | 207 |
| Escenas | 29 | 8 |

Ejemplos: «Entrechocar los talones», «Recubrir la hoja con veneno», «Mover
palancas», «Lanzar conjuro», «Recuperar espacios de conjuro», «Salvación contra
el veneno», «Ensordecido» y «Escalera izquierda del sótano». También se corrigen
etiquetas que confundían características con habilidades, tipos de criatura,
barajas con cubiertas, conjuros con ortografía y daño con acciones de guardar.

Se contrastó la descripción original de los casos ambiguos: el talismán del
mal afecta al contacto a criaturas que **no sean infernales ni muertos vivientes**;
la tintura pálida dispone de un efecto que reduce los PG máximos para representar
su impedimento de curación. Solo se corrigieron sus nombres visibles.

Las decisiones explícitas están en `reviewed-labels.json`, separadas por
compendio y texto de origen. No se aplican sustituciones globales a párrafos.
El auxiliar rechaza claves de origen ausentes y cambios de cifras o referencias.

```sh
python -B dev-tools/translation/apply_reviewed_labels.py
python -B dev-tools/translation/apply_reviewed_labels.py --apply
python -B dev-tools/translation/audit_translation.py
```

La primera orden previsualiza; la segunda aplica a los JSON de Babele; la
tercera valida los siete compendios contra sus originales. La auditoría posterior
dio cero errores técnicos, cero discrepancias numéricas y cero campos ausentes.
Las reglas de este lote deben reaplicarse si se regenera deliberadamente una
traducción desde cero. La generación ordinaria conserva campos editados.

## Lote de descripciones representativas

Se revisaron seis descripciones completas contra el original y el OCR español:
bolsa de contención (p. 252), botas de velocidad (p. 254), daga de la ponzoña
(p. 266), poción de curación (p. 305), anillo de protección (p. 233) y varita de
proyectiles mágicos (p. 322). La poción ya era correcta; se retiró solo un salto
de línea final. Las notas exclusivas de Foundry se contrastaron con su original.

Se corrigió la dimensión de la bolsa: «2 pies de lado» no significa «2 pies
cuadrados». Se unificaron sintonización, acción adicional y rareza infrecuente.
El nombre oficial **Daga de la ponzoña** sustituye a «Daga de veneno», incluidas
cuatro etiquetas de enlaces UUID/Embed en tres campos de diarios y tablas.
Se conservan las distancias y pesos ingleses configurados en Foundry.

Decisiones y referencias: `reviewed-descriptions.json`. Para previsualizar o
aplicar: `python -B dev-tools/translation/apply_reviewed_descriptions.py`
(añadir `--apply` para escribir). El auxiliar valida números, referencias y la
secuencia completa de etiquetas HTML antes de escribir. Este lote añade diez
campos cambiados a los 424 del lote anterior: **434 campos en total**.

## Actores y escenas — segundo lote del 29 de septiembre

Se revisaron los **606 campos de texto de los 72 actores** contra el original
inglés local: 340 textos distintos, incluidos 108 párrafos distintos presentes
en 124 campos. La comparación con el OCR español fue terminológica y selectiva;
no se presenta como un cotejo íntegro con la edición española. Se corrigieron
**253 campos de 58 actores**, de ellos 109 descripciones o biografías.

El lote incluye ataques, ventajas, salvaciones, duraciones, equipo anidado,
trampas y peligros. Corrige traducciones que confundían daño contundente,
tiradas, condiciones, dados y acciones. Se revisaron también los requisitos
y mensajes de actividades, no solo los párrafos. Se conservan las reglas y
unidades del original, incluidas las particularidades de criaturas heredadas.

`reviewed-actor-texts.json` identifica cada fuente por SHA-256 y guarda la
traducción aprobada, sin incorporar los originales ingleses. Para previsualizar:
`python -B dev-tools/translation/apply_reviewed_actor_texts.py`; añadir `--apply`
para escribir. El auxiliar rechaza cambios de cifras, referencias o HTML y
fuentes revisadas que hayan desaparecido. La segunda ejecución no propone cambios.

Se leyeron los **142 campos de las 24 escenas**. Además de las correcciones del
primer lote, se corrigieron nueve campos de notas: **Posada de la Torre Alta**,
**Arcanos Desenterrados** y **Templo del Horizonte Lejano**, contrastados con las
páginas 155, 152 y 156 del OCR español. `reviewed-labels.json` recoge todas las
etiquetas de escenas. No se revisa el texto dibujado dentro de imágenes.

Este segundo lote añade **262 campos cambiados**. La auditoría de los siete
compendios mantiene cero errores técnicos, numéricos o campos ausentes.

## Tablas y nombres enlazados — tercer lote del 29 de septiembre

Revisados los **1738 campos de las 125 tablas**: 1555 textos de origen distintos,
incluidas referencias que no requieren traducción. Se corrigieron **803 campos
de 117 tablas**, más **23 campos de equipo y seis de diarios** para unificar
nombres y etiquetas de enlaces: **832 campos cambiados** en este lote.

La revisión compara significado, condiciones y cifras con el original inglés.
El OCR español se consultó selectivamente: gemas, cartas, nombres, planos,
objetos y categorías de tesoro. No se certifica una coincidencia literal con
todas las tablas de la edición española. Los nombres propios propuestos se
conservan con la grafía inglesa cuando no se estableció una equivalencia española
inequívoca; se eliminan las deformaciones del traductor automático. Al combinar
fragmentos de nombres de tabernas, el DM debe ajustar orden y concordancia.

Se corrigen, entre otros, gules traducidos como perros, estados y salvaciones
mal expresados, pergaminos «ortográficos», confusión entre dados y muerte,
espíritus y aguardiente, daño adicional y PG, y supresión de negaciones.
Se mantienen todos los rangos, UUID, fórmulas y etiquetas HTML originales.

Decisiones: `reviewed-table-texts.json`, con huella del original y documentos
de aplicación. Reproducción: `python -B dev-tools/translation/apply_reviewed_table_texts.py`
(añadir `--apply` para escribir). `reviewed-names.json` y
`apply_reviewed_names.py` mantienen los nombres explícitamente revisados y solo
las etiquetas completas de enlaces que correspondan al documento. No sustituyen
libremente menciones de texto ni etiquetas abreviadas con otro contexto.

Los auxiliares previsualizan cero cambios después de aplicar el lote. La
auditoría de los siete compendios y las 25 pruebas Node pasan con los originales.

**Defecto de la fuente:** en `dmgRelicsVeryRar`, resultado `RgbHDoIKuQzusHhk`,
la etiqueta «Cuerno de Valhalla (bronce)» contiene un UUID dirigido a
`equipment.Item.dmgFwpBronzeGrif`, la figurilla de grifo de bronce. La misma
referencia está en el original DMG 2.0.0 y se conserva. El destino existe, por lo
que una comprobación de enlaces resolubles no detecta este error semántico.
Para ese resultado, abrir manualmente el cuerno de bronce en Equipo.

## Equipo — cuarto lote del 29 de septiembre

El registro `reviewed-equipment-texts.json` cubre **835 de los 2449 campos**
de equipo, en 311 documentos, incluidas **79 descripciones completas**. Combina
el cotejo de los primeros objetos, las seis descripciones anteriores, etiquetas
ya aprobadas y textos completos idénticos a los revisados en actores. Cada
decisión conserva la huella SHA-256 de la fuente y los documentos de aplicación.
No se considera revisado un objeto entero por tener solo una etiqueta aprobada.

Este lote cambia **179 campos de 96 objetos**. Incluye la jarra alquímica,
armaduras, bolsas, bendiciones, instrumentos de los bardos, libros artefacto y
botas. Corrige aceite, unidades de capacidad, tipos de criatura, salvaciones,
inmunidades, órdenes, iniciativa y efectos. Se conservan las unidades de Foundry,
las referencias, fórmulas, cifras y etiquetas HTML. Se corrigieron además tres
campos de tablas y uno de bastiones con acentos dañados en nombres o mensajes.

El contraste con el OCR español sigue siendo selectivo. Se verificaron los
nombres Oleaje y Rotundo en el pasaje de Negrarma (página 297), las herramientas
del Hacha de los Señores Enanos (páginas 282–283) y la barcaza del Bote plegable
(página 255). Se conserva el **ocaso** del original inglés para el conflicto
de Negrarma, aunque el OCR español indica amanecer.

Reproducción: `python -B dev-tools/translation/apply_reviewed_equipment_texts.py`
(previsualización; añadir `--apply` para escribir). El auxiliar rechaza cambios
de referencias, cifras o estructura HTML. Los auxiliares de nombres, etiquetas
y las seis descripciones anteriores no proponen cambios tras aplicar este lote.
Pasaron las 25 pruebas Node y la auditoría completa de originales.

## Equipo — quinto lote del 29 de septiembre

El registro alcanza **1171 campos en 337 documentos**, incluidas **159
descripciones completas**: 336 campos más que el lote anterior. Este lote cambia
183 campos de 80 objetos, más una etiqueta en tablas y una en diarios.

Incluye cuernos de Valhalla, velas, sortilegios, capas, cubos, barajas, armaduras
y el Demonomicon. Corrige la distinción entre brujo y hechicero, los tipos
infernal/autómata, luz tenue, daño, condiciones de activación y el orden de los
turnos de invocaciones. Las cartas quedan concordadas con las tablas revisadas:
Calabozo, Euríale, Rompecabezas, Canalla, Erudito y El Vacío. El cuerno de latón
adopta la denominación del OCR español, en lugar de «bronce amarillo».

Se conservan fuentes, cifras, referencias y HTML. Las 25 pruebas Node y la
auditoría de originales pasan; los auxiliares de equipo, tablas y nombres
previsualizan cero cambios. La última comprobación en Foundry corresponde al
lote anterior de las 08:04:31 UTC; no se atribuye a estos cambios posteriores.

## Equipo — sexto lote del 29 de septiembre

El registro alcanza **1561 campos en 388 documentos**, incluidas **257
descripciones completas**: 390 campos más que el lote anterior. Este lote
cambia 182 campos de 96 objetos, tres etiquetas de tablas y dos de diarios.

Incluye anillos elementales, objetos imbuidos, Ojo y Mano de Vecna, figurillas,
guantes, granadas, pólvora, sombreros y yelmos. Se corrigen omisiones del tipo
de daño, instrucciones de salvación, cargas, concentración, invocación y
recuperación de usos. Los nombres Búho de serpentina y Cabra de trabajo se
cotejaron con el OCR español; se mantiene la distinción entre el dragón de
oropel y el metal latón.

Las decisiones se registran por fuente completa y documento. Se conservan
cifras, fórmulas, referencias y etiquetas HTML. Pasan las 25 pruebas Node y
la auditoría de los siete compendios. Los auxiliares de nombres, tablas,
etiquetas y equipo previsualizan cero cambios tras aplicar el lote.

Foundry volvió a validar los 873 documentos a las **08:39:25 UTC**, con cero
errores y cero enlaces pendientes. La evidencia local se conserva en
`tmp/equipment-review-3-validation.json`. No se importaron documentos nuevos.

## Alcance pendiente

Los lotes revisados **no acreditan la revisión íntegra de los 6021
campos ni de las aproximadamente 233 000 palabras** de los siete compendios.
Quedan por revisar las descripciones extensas de equipo y los párrafos de diarios,
además de la concordancia entre etiquetas nuevas y menciones
en párrafos. La referencia para esa revisión es el OCR español local y el
original inglés exportado; se conservan las unidades de Foundry.

La publicación definitiva sigue condicionada a esa revisión. El canal preliminar
existente no se convierte en estable por superar las comprobaciones técnicas.
