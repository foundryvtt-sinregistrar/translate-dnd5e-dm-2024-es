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

## Equipo — séptimo lote del 29 de septiembre

El registro alcanza **1914 campos en 453 documentos**, incluidas **377
descripciones completas**: 353 campos más que el lote anterior. Este lote
cambia 151 campos de 107 objetos y una etiqueta en cada uno de los compendios
de actores, tablas y diarios.

Incluye instrumentos de bardo, piedras ioun, armas, trampas, orbes, pociones
y objetos de captura. Corrige condiciones de activación, tipos de criatura,
componentes, efectos y notas de uso. La reutilización de «Ram» se concreta como
«Ariete» en el objeto de asedio; «Embestida» se mantiene en los ataques de actores.
Se concordó además «Colocar enredadera feroz» en ambos compendios.

Se detectó una discrepancia propia del original DMG 2.0.0: la descripción de
`dmgFirePotionOfG` indica Fuerza 23, pero la tabla general indica 25 y su efecto
`Men77BWldNXaCmrA` configura 25. Se conservan los datos de la fuente y se
documenta el requisito de interpretar esa descripción junto a su tabla y efecto.

La auditoría de originales, las 25 pruebas Node y la reaplicación de los
registros pasan. La comprobación de Foundry de las 08:39:25 UTC corresponde
al lote anterior; no se atribuye a estos cambios posteriores.

## Equipo — octavo lote del 29 de septiembre

El registro completa los **2449 campos de los 548 documentos**, incluidas
**539 descripciones completas**, mediante 1990 huellas de texto inglés y
ámbitos explícitos de documentos. Se han cotejado los 535 campos restantes;
el lote cambia 261 campos de 183 objetos, una etiqueta de actor y cinco campos
de diarios. Los diarios reciben concordancias de enlaces, sin dar por revisados
sus párrafos completos.

Incluye anillos, túnicas, varas, pergaminos, bastones, espadas, varitas y peligros.
Se corrigen negaciones, requisitos de clase, estados, tipos de daño, duraciones,
instrucciones de uso y nombres de actividades. El Tomo de la lengua silenciada
lanza sin componentes verbales ni somáticos. Oleaje, Forjatrueno, Rotundo y el
clan Martillofuerte se cotejan con el OCR español.

El cotejo también corrige una decisión del séptimo lote: **Razorvine es
enredadera afilada**; **Vicious Vine es enredadera feroz**. Se actualizan el objeto,
su actividad, la actividad del actor y las etiquetas de enlaces, conservando
ambas criaturas diferenciadas y sus respectivos datos mecánicos.

El texto se compara íntegramente con el original inglés; el contraste del OCR
español es selectivo. No se afirma una transcripción literal de la edición
española. Se conservan las unidades de Foundry, las cifras, las fórmulas, las
referencias y la secuencia de etiquetas HTML.

La auditoría de los siete compendios y las 25 pruebas Node pasan. Los registros
de nombres, etiquetas, descripciones, equipo, actores y tablas se reaplican sin
cambios pendientes.

Foundry validó los 873 documentos y 3468 referencias a las **09:31:11 UTC**,
con cero errores y cero destinos pendientes. Evidencia local:
`tmp/equipment-review-5-validation.json`. Se conservaron los documentos del
mundo y se restauraron la macro y la configuración de módulos tras la prueba.

## Diarios — primer lote amplio del 29 de septiembre

El registro `reviewed-content-texts.json` cubre **262 de los 949 campos**,
mediante 233 huellas del original inglés. Incluye 111 campos de texto de página.
Se han cotejado por completo seis documentos: glosario de trasfondo (151 campos),
ejemplos de aventuras (13), recompensas (11), ilustraciones de los apéndices (12),
mapas del apéndice B (31) y bastiones (21). Los otros 23 campos son títulos
compartidos de otros diarios; no acreditan sus párrafos.

El lote cambia 157 campos de siete documentos. Corrige omisiones, negaciones,
género de personajes, nombres, criaturas, acciones e instrucciones. Se conservan
los identificadores, cifras, unidades de Foundry y secuencia de etiquetas HTML.
Las guías fonéticas entre paréntesis conservan la notación inglesa del original;
no se presentan como una adaptación fonética española.

El contraste selectivo con el OCR español detecta discrepancias entre fuentes:

- En Compañeros del Salón, el original inglés dice «his adoptive father» y el
  OCR español «padre adoptivo de ella». Se conserva la construcción del inglés
  con «su padre adoptivo», sin afirmar que las dos fuentes coincidan.
- En El arroyo corrompido, la entrada a la cueva está al sureste en el original
  de Foundry y al suroeste en el OCR español. Se conserva el sureste del módulo.
- Se conserva la referencia a `Quests from the Infinite Staircase` de la entrada
  de Zargon, presente en Foundry y ausente del pasaje español cotejado.

Las instrucciones de bastiones usan las etiquetas de configuración de la
dependencia local. `Advance Bastion Turn` conserva el texto inglés del botón:
ravanno 6.0.3 no traduce la clave `DND5E.Bastion.Action.Advance` del sistema.
La tabla de espacios mantiene reducido/amplio/enorme, como el texto ya revisado;
el diccionario de la interfaz usa estrecho/espacioso/vasto para esas categorías.

Pasan las 25 pruebas Node, la auditoría de los siete compendios y la reaplicación
sin cambios de todos los registros. La validación Foundry de las 09:31:11 UTC
precede a este lote y no se atribuye a estos textos nuevos. Quedan 687 campos
de diarios por cotejar y la concordancia final de nombres y menciones en prosa.

## Diarios — segundo lote amplio del 29 de septiembre

El registro alcanza **533 de 949 campos**, con 464 huellas de fuente y 128
textos de página. Se completan otros trece diarios: cierre de aventuras,
premisa e inicio de campaña, las ocho colecciones de ilustraciones de capítulos,
historial oficial y progreso de personajes. El total es de 19 diarios completos.
Los 271 campos añadidos incluyen muchos títulos y pies de ilustración; este
recuento no equivale al porcentaje de palabras revisadas.

El lote cambia 173 campos de 15 documentos. Corrige tipos de campaña,
motivaciones, creación de personajes, concesión de PX, recuperación al subir de
nivel, nombres de lugares y pies de imagen. Se conservan los nombres comerciales
Critical Role, Spelljammer y Magic: The Gathering. «Cover» corresponde a la portada
del libro, comprobada mediante la ruta de imagen del original.

El historial oficial se traduce como documento histórico, sin convertir sus
afirmaciones en resultados de QA actuales. En particular, la entrada 1.2.0 dice
que ya no se necesita conservar el ID al importar escenas; los requisitos y
limitaciones comprobados para las escenas del entorno actual siguen descritos
en la documentación funcional. También se restaura el fragmento técnico
`system.damage.parts | Add |` que el borrador había dejado incompleto.

Pasan las 25 pruebas Node y la auditoría completa, sin cambios pendientes al
reaplicar los textos revisados. Foundry validó **873 documentos y 3468
referencias a las 10:16:12 UTC**, sin errores ni destinos pendientes.
Evidencia local: `tmp/content-review-2-validation.json`. No se importaron
documentos al mundo; se restauraron la macro y los módulos, y se verificó la
partida en pausa con cero módulos activos.

Quedan **416 campos de diarios** por cotejar, incluyendo capítulos extensos
de cosmología, herramientas y dirección de partidas, además de la concordancia
final de menciones y etiquetas.

## Alcance pendiente

### Tercer lote de diarios — cosmología, creación y créditos

El registro alcanza **617 de 949 campos**, con 548 huellas de fuente,
173 textos de página y **23 diarios completos**. Se completa el cotejo de
Cosmología, Crear aventuras, Creación de campañas y Créditos. Este lote cambia
64 campos de esos cuatro documentos; mantiene las cifras, referencias técnicas
y secuencia de etiquetas HTML del original.

Se corrigen las tiradas y transformaciones de los planos, tamaños de objetos
en el Limbo, distinción entre diablos, demonios e infernales, y nombres del OCR
español: Parajes Feéricos, Páramo Sombrío, Monte Celestia, río Estigio, río Océano,
Prismalia y ciudades portal. Las reglas de muerte de Ysgard conservan la
restricción a combate y excluyen autómatas y muertos vivientes.

Se recuperan nombres de autores alterados por el borrador: CoupleOfKooks,
Linda Lithen, Even Amundsen y Justice Ramin Arman. Los créditos se cotejan con
el texto inglés íntegro; no se sustituyen titulares ni se altera el aviso de
derechos del producto oficial.

El original de Agua contiene dos frases incompletas («from within the at the
horizon» y «The nominal of the marids»). Se regulariza la primera sin inventar
un elemento ausente; la segunda se completa como «emperador nominal», con apoyo
del OCR español y de la referencia al emperador en el mismo párrafo inglés.
Prismalia omite el sujeto de «resides»; se restituye Zybilna, identificada en
el párrafo y en el OCR. «Llanos de Sal» conserva el nombre de la edición española
para Silt Flats, aunque su descripción corresponde a sedimentos y lodo.

Quedan **332 campos de diarios** y la concordancia final. Los nombres de páginas
revisados todavía pueden tener menciones antiguas en los capítulos restantes.
Las comprobaciones estructurales no sustituyen ese cotejo editorial.

Pasan las 25 pruebas Node y la auditoría de los siete compendios; reaplicar
el registro no genera cambios. La prueba Foundry de las 10:16:12 UTC precede
a este lote y no se atribuye a estos nuevos textos.

### Cuarto lote de diarios — Herramientas de DM

Cotejo completo de las 26 páginas de Herramientas de DM: el registro alcanza
**662 de 949 campos**, 593 huellas de fuente, 199 textos de página y
**24 diarios completos**. Se añaden 45 campos revisados y se corrigen 30 de un
documento. Se mantienen las tablas, cifras, referencias y etiquetas HTML.

Se revisan alineamiento, trasfondos, persecuciones, creación de criaturas y
conjuros, maldiciones, muerte, puertas, mazmorras, ambiente, miedo, armas,
dioses, peligros, prestigio, multitudes, PNJ, venenos, renombre, asentamientos,
asedio, dones, trampas, objetos mágicos y lealtad. Se corrigen confusiones entre
acciones y salvaciones, cuadrados de 10 pies de lado y superficies de 10 pies
cuadrados, recarga, tipos de daño, competencias, estados y concentraciones.

El inglés de Linaje feérico omite el nombre del estado en «avoid or end the
condition». Se restituye «hechizada», confirmado por el OCR español (página
PDF 61). Las reglas de lealtad del original incluyen **10** tanto en «10 or
higher» como en «between 1 and 10»: se conserva y documenta ese solapamiento,
sin cambiar unilateralmente el umbral de juego. Las listas que conservan el
orden inglés lo indican expresamente.

Pasan las 25 pruebas Node y la auditoría de los siete compendios. La comprobación
en Foundry de las 10:16:12 UTC precede a este lote; no acredita los textos nuevos.
Quedan **287 campos de diarios** y la concordancia final, incluidas las etiquetas
de páginas y las menciones a objetos y peligros en distintos compendios.

### Quinto lote de diarios — Greyhawk y preparación de la mesa

El registro alcanza **742 de 949 campos**, 672 huellas de fuente, 237 textos
de página y **33 diarios completos**. Se incorporan 80 campos cotejados y se
corrigen 55 campos de ocho documentos. Se completa el capítulo de Greyhawk:
Ciudad Libre, alrededores, cinco regiones, historia, conflictos, calendario,
facciones, magia, misterios y tabla de deidades. También se revisan implicación
de los jugadores, final de campaña, diversión compartida y referencias de Foundry.

El cotejo recupera topónimos y nombres propios de la edición española, corrige
géneros y especies omitidas de gobernantes y distingue dioses mayores, menores
y semidioses. Se eliminan errores como «espada y orgía», «Reino de España»,
«Ducado de Luxemburgo» y «Horno Unicornio» presentes en el borrador. Las
instrucciones de seguridad de mesa mantienen los límites firmes y flexibles,
las señales, el anonimato y la ausencia de obligación de justificar un límite.

Se conservan los niveles, fechas, unidades originales de Foundry, referencias
y estructura HTML. Los títulos de productos sin traducción española empleada
por el OCR se mantienen en inglés. El OCR presenta variantes de Bright Desert
(Brillante y Deslumbrante); este lote utiliza Desierto Brillante de forma coherente
en los textos revisados, pendiente de la concordancia final con mapas y etiquetas.

Pasan las 25 pruebas Node y la auditoría de los siete compendios: cero errores,
cero diferencias numéricas pendientes y reaplicación sin cambios. La validación
en Foundry de las 10:16:12 UTC sigue siendo anterior a este lote. Quedan
**207 campos de diarios**, la concordancia final y la validación actualizada.

### Sexto lote de diarios — planificación y objetos mágicos

El registro alcanza **825 de 949 campos**, 755 huellas de fuente, 279 textos
de página y **38 diarios completos**. Se incorporan 83 campos y se corrigen
41 de cinco documentos: Plantear la premisa, listas y reglas de objetos mágicos,
Planificar aventuras y Planificar encuentros.

Se revisan la libertad de decisión de los jugadores, objetivos de encuentros,
presupuesto de PX y sus ejemplos, tácticas de reacción, descansos y encuentros
aleatorios. Se corrigen nombres deformados de criaturas, como osgos, ramas
marchitas, estirges y tumularios. Las tablas numéricas mantienen todos los valores
del original, sin multiplicadores ni cambios de edición añadidos.

Las reglas de objetos conservan acciones, concentración, requisitos de clase y
de lanzador, sintonización, cargas, resistencia, fabricación, ayudantes y materiales.
Se restituyen el segundo guante de los objetos emparejados y las excepciones de
los pergaminos a las reglas de tiempo, coste y valor. El catálogo A–Z conserva
su orden inglés y lo explica; las páginas formadas por enlaces e inclusiones
reutilizan el equipo ya revisado. Las tres bolsas de trucos concuerdan con sus
objetos de destino.

Pasan las 25 pruebas Node y la auditoría: cero errores y cero diferencias
numéricas pendientes. Quedan **124 campos de diarios**, la concordancia final
y la validación actualizada en Foundry. La sesión de las 10:16:12 UTC no se
atribuye a estos nuevos textos.

Los lotes revisados **no acreditan la revisión íntegra de los 6021
campos ni de las aproximadamente 233 000 palabras** de los siete compendios.
Quedan por revisar los párrafos de diarios,
además de la concordancia entre etiquetas nuevas y menciones
en párrafos. La referencia para esa revisión es el OCR español local y el
original inglés exportado; se conservan las unidades de Foundry.

La publicación definitiva sigue condicionada a esa revisión. El canal preliminar
existente no se convierte en estable por superar las comprobaciones técnicas.

### Séptimo lote de diarios — resolución y combate

El registro alcanza **864 de 949 campos**, 794 huellas de texto fuente, 299
textos de página y **40 diarios completos**. Se revisan los índices 755–793 de
la instantánea local: 39 campos de *Resolving Outcomes* y *Running Combat*.
Se cotejaron los procedimientos de pruebas con d20, tiradas de ataque y
salvación, consecuencias, improvisación, iniciativa, puntos de golpe, estados,
terreno, ritmo y dificultad. Se conservaron fórmulas, dados, cifras y referencias.

La reaplicación del registro no introduce cambios; la auditoría informa cero
errores y cero diferencias numéricas pendientes, y pasan las 25 pruebas Node.
Estos resultados verifican la estructura y el código, no sustituyen la
validación funcional de Foundry. El lote está pendiente de confirmación y CI.
Quedan **85 campos**, índices 794–877, además de la concordancia entre
compendios y la validación final en Foundry.

### Octavo lote de diarios — exploración y viajes

El registro alcanza **882 de 949 campos**, 812 huellas de texto fuente, 308
textos de página y **41 diarios completos**. Se revisaron las 18 filas 794–811
de *Running Exploration* y se corrigieron 14 campos; cuatro títulos ya eran
adecuados. Se cotejaron exploración, mapas, tiempo, acciones, Percepción,
viajes por etapas, desafíos, ritmo de viaje y clima con el original y el OCR
español selectivo (páginas impresas 33–39).

Se restituyeron términos y frases alterados, como «entorno natural»,
«mazmorra», «Ciudad Libre de Falcongrís», «Apariencia» y «hexágonos»; se
conservaron las unidades y cifras del compendio de Foundry, las fórmulas,
tiradas, referencias, inclusiones y estructura HTML. La reaplicación termina
sin cambios, la auditoría no detecta errores ni diferencias numéricas y pasan
las 25 pruebas Node. El lote se integró en `5a2ee7f`; los CI de revisión y
`develop` pasaron. Quedan **67 campos**,
índices 812–877, la concordancia entre compendios y la validación final en Foundry.

### Noveno lote de diarios — interacción social

El registro alcanza **888 de 949 campos**, 818 huellas de texto fuente, 311
textos de página y **42 diarios completos**. Se revisaron los seis campos
812–817 de *Running Social Interaction*; se corrigieron los tres párrafos y
sus tres títulos ya eran adecuados. Se cotejaron la meta del encuentro, la
interpretación y representación de PNJ, la participación de los jugadores,
las actitudes, las pruebas de característica y la acción Ayudar con el original
y el OCR español de las páginas impresas 32–33.

Se corrigieron calcos y errores de sentido, como «cheques Carisma», «juego
pesado», «Retratos de PNJ» y «Controles de habilidad». La reaplicación termina
sin cambios; la auditoría detecta cero errores y diferencias numéricas y pasan
las 25 pruebas Node. El commit `6da79a3` se integró en `develop` y pasaron los CI de revisión y
`develop`. En ese punto quedaban **61 campos**, índices 818–877, además de la
concordancia y la validación final en Foundry.

### Décimo lote de diarios — dirección de partidas

El registro alcanza **906 de 949 campos**, 836 huellas de texto fuente, 320
textos de página y **43 diarios completos**. Se cotejaron los 18 campos
818–835 de *Running the Game* con el original inglés y el OCR español selectivo
(páginas impresas 20–26). Se corrigieron 11 textos; siete títulos ya eran
adecuados.

Se revisaron las preferencias de los jugadores, el tamaño de grupo, las
ausencias y las incorporaciones, el rol del DM y la narración. Se corrigieron
calcos de interfaz y formulaciones que alteraban el sentido, conservando
UUID, fórmulas, cifras, referencias, comandos y HTML. La reaplicación termina
sin cambios; la auditoría detecta cero errores y diferencias numéricas y pasan
las 25 pruebas Node. `git diff --check` también pasa. Pendiente commit y CI.
Quedan **43 campos**, índices 836–877; la concordancia entre compendios y la
validación final en Foundry siguen pendientes.
