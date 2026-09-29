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

## Alcance pendiente

Este lote corrige etiquetas, **no acredita la revisión íntegra de los 6021
campos ni de las aproximadamente 233 000 palabras** de los siete compendios.
Quedan por revisar las descripciones extensas de equipo, los párrafos de diarios
y tablas, además de la concordancia entre etiquetas nuevas y menciones
en párrafos. La referencia para esa revisión es el OCR español local y el
original inglés exportado; se conservan las unidades de Foundry.

La publicación definitiva sigue condicionada a esa revisión. El canal preliminar
existente no se convierte en estable por superar las comprobaciones técnicas.
