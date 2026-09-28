# Validación funcional de DM — 28 de septiembre de 2026

## Resultado

La muestra funcional funciona en Foundry: diarios importados, imágenes,
enlaces, tiradas simples y anidadas, consumibles, cargas, ataques, efectos y
contenedores. Las **12 comprobaciones de objetos** pasaron en dos actores de
prueba, uno con datos originales y otro con la traducción aplicada.

La auditoría de tablas tiene **una observación de origen**: `dmgWildernessCha`
usa `1d12` pero carece de resultados 8–12 en DMG 2.0.0. No se modificaron los
compendios oficiales ni los JSON de traducción para suplir esa carencia.
Este resultado amplía el piloto; no certifica todas las funciones ni la calidad
lingüística de los 873 documentos.

## Entorno y aislamiento

Mundo **Testing** (`testing`), Foundry **14.368**, dnd5e **6.0.3**, idioma `es`.
Módulos activos durante la prueba:

| Módulo | Versión |
|---|---|
| DMG oficial | 2.0.0 |
| PHB oficial | 2.2.0 |
| MM oficial | 1.4.0 |
| Traducción de DM | 0.1.1 |
| Babele | 2.9.1 |
| libWrapper | 1.13.5.1 |
| Español de Foundry | 14.368.1 |
| Español de dnd5e (`ravanno-dnd5e-es`) | 6.0.3 |

PHB y MM permiten resolver referencias entre productos. Sus traducciones de
compendios no estaban activas: un destino enlazado como **Magic Missile** puede
seguir en inglés. El capítulo 3 importado en la prueba anterior permite resolver
el UUID de mundo del santuario; véase [ENLACE-SANTUARIO.md](ENLACE-SANTUARIO.md).

Se crearon carpetas **QA - DM funcional 2026-09-28** y dos actores nuevos.
Las importaciones usan IDs nuevos y marcas propias para reutilizar exclusivamente
esas muestras. Se conservaron los documentos que ya existían en el mundo.
Las pruebas de consumo, curación y efectos modifican solo los actores QA.

## Diarios, imágenes y enlaces

| Comprobación | Resultado |
|---|---|
| Catálogo de siete compendios | 873 documentos; cero diferencias de texto detectadas por el validador |
| Referencias UUID/Embed del catálogo | 3468 apariciones; cero destinos sin resolver en este entorno |
| `dmgBringItToAnEn` — Ponerle fin | Importación de 2 páginas; 2 enlaces enriquecidos |
| `dmgMagicItemList` — listas de objetos mágicos | Importación de 11 páginas; 1789 enlaces enriquecidos |
| `dmgBMaps00000000` — Apéndice B: Mapas | Importación de 15 páginas; 15 enlaces enriquecidos y 15 imágenes disponibles |
| Total de diarios importados | 28 páginas y 1806 enlaces; ningún enlace marcado como roto al enriquecer HTML |

Las 15 imágenes del apéndice respondieron correctamente con tipo de contenido
de imagen. Se abrió la copia importada y se vio el mapa **Cripta de túmulo**,
su índice y títulos españoles. El texto dibujado dentro del mapa sigue en inglés,
como en el recurso oficial.

Se abrió **Ponerle fin** desde su ficha de compendio y se accionó el dado de la
tabla incrustada **Clímax para aventuras**: apareció una tirada `1d10`, resultado
4, y el texto español correspondiente en el chat. La importación de ese diario
se comprobó además mediante la API de documentos.

Los recuentos son apariciones de referencias, no destinos únicos. La resolución
del UUID no prueba todos los saltos a anclas internas ni todas las acciones que
pueda ofrecer la ficha enlazada. No se hizo clic manualmente en 3468 enlaces.

## Tablas

Se compararon **fórmula e ID/rango de cada resultado** de las 125 tablas con las
exportaciones locales originales. Coinciden en todas. Se enumeró cada total
posible: 124 tablas tienen resultados para todos ellos y una presenta el hueco
documentado abajo.

Se importaron y ejecutaron estas cinco muestras:

| ID de tabla | Tipo de prueba | Valores de frontera comprobados |
|---|---|---:|
| `dmgAdventureClim` | Texto narrativo | 10 |
| `dmg100GpGemstone` | Tesoro | 10 |
| `dmgArcanaCommon0` | Referencias a objetos | 72 |
| `dmgAstralColorPo` | Varios resultados simultáneos | 20 |
| `dmgEtherCyclone0` | Texto y referencia a subtabla | 5 |
| **Total** | **Sin diferencias entre resultados esperados y obtenidos** | **117** |

En cada tabla se hizo también una extracción aleatoria sin publicar en el chat.
Los 117 valores son los extremos distintos de los intervalos de estas cinco
tablas; no representan 117 tablas ni una prueba aleatoria exhaustiva.

Los resultados múltiples de **Astral Color Pools** son intencionados: plano y
color comparten el mismo rango. **Ether Cyclone** también devuelve dos entradas
en 13–19. Se probó por separado el total 13 con recursión activada: devuelve el
texto del ciclón y un resultado real de su subtabla, sin error.

### Observación: Wilderness Chase Complications

UUID: `Compendium.dnd-dungeon-masters-guide.tables.RollTable.dmgWildernessCha`.
Nombre español actual: **Complicaciones de Wilderness Chase**.

- DMG 2.0.0 declara `1d12`, con siete filas cuyos rangos cubren solo 1–7.
- La exportación original y la tabla traducida conservan idénticos rangos.
- Al forzar separadamente 8, 9, 10, 11 y 12 mediante `RollTable.roll`, cada
  llamada devuelve cero resultados.
- El algoritmo de extracción ordinario de Foundry vuelve a tirar si no
  encuentra resultado. Por ello esta tabla no permite representar normalmente
  esos cinco valores como resultados diferenciados.

Hasta revisar/corregir los datos del producto oficial, realizar la tirada
manualmente y consultar su contenido. No reducir la fórmula a `1d7` ni inventar
filas desde la traducción. No se ha enviado una incidencia externa ni se afirma
que otras versiones del producto mantengan este comportamiento.

## Objetos: original frente a traducción

Se usaron dos PNJ QA con las mismas características (FUE/DES/CON 14, CA natural
12, velocidad 30 pies y 20/60 PG). Cada uno recibió seis objetos: uno desde la
exportación original inglesa y otro desde el compendio traducido. Los IDs que
aparecen en esta tabla pertenecen al compendio `dnd-dungeon-masters-guide.equipment`.

| Objeto / ID | Comportamiento comprobado en ambos actores |
|---|---|
| Poción de curación / `dmgPotionOfHeali` | Activar consume una de dos unidades; curación `2d4 + 2`; aplicación a PG correcta |
| Varita de proyectiles mágicos / `dmgWandOfMagicMi` | Conjuro del PHB resuelto y copiado al actor; una activación reduce cargas de 7 a 6 |
| Daga de veneno / `dmgDaggerOfVenom` | Tiradas de ataque `1d20 + 2 + 2 + 1` y daño `1d4 + 2 + 1` |
| Anillo de Protección / `dmgRingOfProtect` | Equipar y sintonizar aumenta CA de 12 a 13 y salvación de DES de +2 a +3; retirar revierte el bono |
| Botas de velocidad / `dmgBootsOfSpeed0` | Actividad ejecutada; efecto aplicado al actor duplica 30 → 60 pies; desactivarlo revierte a 30 |
| Bolsa de contención / `dmgBagOfHolding0` | Admite la poción; 0,5 lb de contenido no aumentan el peso total de 5 lb declarado por estos datos oficiales |

Resultado: **6 × 2 = 12 comprobaciones correctas**. Los valores aleatorios pueden
variar; coinciden fórmulas, consumo y cambios mecánicos observados.

Las botas tienen un perfil de efecto asociado a su actividad: habilitar el
perfil en el objeto no lo aplica al actor. La prueba activa la actividad y crea
una copia del efecto en el actor, preparando sus cambios mediante
`ActiveEffect.implementation.forApplication`, como hace el control del sistema.
Al terminar se desactiva esa copia. La actividad oficial no define objetivos
de consumo; esta prueba no acredita un descuento automático de sus 600 unidades
ni el transcurso de su duración.

Además se probó la poción desde la interfaz: **Consumir → Usar característica →
Tirada**. La cantidad bajó de 2 a 1, apareció la tarjeta española y se obtuvo una
curación de **7**. No se aplicó esa tirada manual a otros actores. La aplicación
de curación a PG sí se verificó en ambos actores por la prueba anterior.

Se observó la etiqueta de objetivo **Cualquiera Undefined criaturas** en esa
tarjeta. No impidió consumir o tirar. El seguimiento confirmó parámetros
`{number}` incorrectos en el diccionario de `ravanno-dnd5e-es`; se preparó un
parche para esa dependencia y se probó con 45 casos. Posteriormente se aplicó
a la copia local con respaldo, se verificó tras recargar y la tarjeta dejó de
mostrar `Undefined`. Véase [DIAGNOSTICO-OBJETIVOS.md](DIAGNOSTICO-OBJETIVOS.md).
Un seguimiento posterior añadió un ajuste local de presentación en la dependencia:
46 casos correctos y tarjeta comprobada como **Cualquier criatura**, conservando
los datos de objetivos. El mismo diagnóstico documenta alcance y reversión.
También siguen presentes etiquetas pendientes de revisión, como
**Haga clic en tacones** y **Espada de abrigo con veneno**. Pasar estas pruebas
no supone aprobar su redacción.

En la muestra inicial no se probaron el veneno y la salvación de la daga,
los niveles superiores de la varita ni su recuperación; se ampliaron después
como se detalla abajo. Siguen fuera del alcance el reparto de proyectiles entre
fichas, la destrucción al agotar cargas, el ciclo completo de descansos,
duraciones en combate, todos los efectos, permisos de jugadores, escenas,
bastiones completos ni todas las combinaciones de módulos.

## Ampliación: veneno, niveles de la varita y recuperación

El **28 de septiembre de 2026, 21:43:31 UTC**, la ejecución final de
`extendedItems()` terminó con **14 casos correctos y cero errores**. Se usaron
las mismas versiones de Foundry, sistema y ocho módulos indicados al principio,
con los parches locales de idioma ya documentados. Se crearon dos actores
separados, `extended-original` y `extended-translated`, dentro de la carpeta QA.
No se utilizaron personajes de una partida.

| Prueba | Casos por versión | Resultado en original y traducido |
|---|---:|---|
| Varita: niveles 1, 2 y 3 | 3 | Consume 1, 2 y 3 cargas; escalado 0, 1 y 2; contador de objetivos 3, 4 y 5; daño por proyectil `1d4 + 1` |
| Varita: cargas insuficientes | 1 | Con una carga restante, intentar gastar tres se bloquea y conserva la carga |
| Daga: veneno | 1 | Activación consume su uso; encantamiento habilita actividad de salvación CON CD 15; daño `2d10`; condición envenenado aplicable y reversible |
| Recuperación al amanecer | 1 | Daga recupera su uso; varita recupera `1d6 + 1`, limitada a 7; `sr` y `lr` no recuperan estos objetos |
| Estado final de los actores QA | 1 | 20 PG, sin envenenado, encantamientos de prueba desactivados, daga sin equipar y con imagen original |
| **Total** | **7 × 2 = 14** | **Correctos** |

### Alcance de la salvación y del veneno

Se invocaron la activación y la aplicación del encantamiento de Foundry. Para
añadir la actividad dependiente de veneno, `applyEnchantment` necesita el
contexto de la **tarjeta de chat de origen**. La primera versión de la prueba
lo omitía y no recibía esa actividad: corregir la prueba resolvió el problema
en original y traducido. No se modificaron los datos de la daga para forzarlo.
La ejecución final verificó que las tarjetas de aplicación eran privadas para
el GM que ejecutaba la macro (`rollMode: 'self'`). Las tarjetas de los ensayos
anteriores de estos dos actores QA también quedaron restringidas al mismo GM.

Se tiró una salvación real de Constitución y se comprobó la CD 15. Se verificó
también que la actividad declara daño nulo al superar la salvación. Después se
probaron por separado el daño y la condición en un **escenario controlado de
salvación fallida**, independientemente de la tirada aleatoria anterior.
Por tanto, esta prueba **no acredita que el sistema aplique automáticamente
daño y condición según el resultado de una salvación**.

En la ejecución final, las salvaciones dieron 17 y 14, y las tiradas de daño 10
y 15. La aplicación controlada redujo los PG de 60 a 50 y 45 respectivamente;
después se restauraron a 20. La condición se comprobó activa y después ausente.
No se avanzó tiempo para probar su expiración: los efectos se desactivaron
explícitamente al terminar, incluso si una comprobación fallaba.

### Recuperación y repetición

Se utilizó el calculador real `item.system.recoverUses` con los periodos de
descanso corto, largo y amanecer, aplicando sus actualizaciones a los objetos QA.
No se avanzó el calendario del mundo ni se simularon descansos de personajes.
La recuperación aleatoria de la varita dio 5 y 4 cargas; una segunda comprobación
con una sola carga gastada confirmó que nunca excede 7. Las dagas quedaron con
1 uso y las varitas con 7 al terminar.

La herramienta reutiliza los encantamientos que tienen su actividad dependiente
y desactiva sus efectos al finalizar. La ejecución repetida conservó sus IDs.
Las muestras QA también vuelven a crear un objeto ausente si fue consumido:
se comprobó con la poción del actor traducido de la prueba inicial, restaurada
y abierta con **2 unidades**, sin reemplazar los objetos que seguían presentes.

Macro separada **QA - DM objetos avanzados**:

```js
const qa = await import(
  '/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/validate-functional.mjs'
);
await qa.extendedItems();
```

Evidencia local ignorada: `tmp/functional-extended-items.json`. La sintaxis del
auxiliar pasó `node --check`. No se repitió la auditoría completa de compendios:
no se modificaron las traducciones ni sus mecánicas. La partida volvió a cero
módulos activos, recargada y en pausa. Se conservan los dos nuevos actores,
las tarjetas del GM, los efectos de prueba desactivados y la macro de esta fase.

## Seguimiento: salvación y aplicación desde el chat

El **28 de septiembre de 2026, 21:52:29 UTC**, `saveWorkflow()` pasó **4 casos**
con Foundry 14.368, dnd5e 6.0.3 y las mismas ocho dependencias de la ampliación.
Se comprobó la conexión entre la actividad de veneno, la salvación, la ficha
objetivo y las tarjetas de daño y efectos, usando documentos reales del mundo.

| Versión | Salvación QA contra CD 15 | Multiplicador del chat | Daño tirado | PG después de aplicar daño | Envenenado |
|---|---:|---:|---:|---:|---|
| Original, éxito | 103 | 0 | 13 | 60 | No; el GM omite aplicar el efecto |
| Original, fallo | −91 | 1 | 14 | 46 | Sí, tras la acción de aplicar efectos |
| Traducción, éxito | 118 | 0 | 13 | 60 | No; el GM omite aplicar el efecto |
| Traducción, fallo | −78 | 1 | 17 | 43 | Sí, tras la acción de aplicar efectos |

Las tiradas usan el motor real con bonificadores temporales de **+100/−100**
exclusivos de la prueba, para garantizar ambas ramas. No representan valores
de una partida ni alteran las características de los actores. Antes de invocar
las acciones de aplicación, los cuatro casos conservaron 60 PG y ningún
envenenamiento: **tirar la salvación y el daño no los aplica por sí solo**.

La prueba renderiza las tarjetas reales y llama a los mismos manejadores que
sus botones (`_onApplyDamage` y `_onApplyEffects`). Comprueba que el control
de daño obtiene automáticamente 0 tras éxito y 1 tras fallo. El efecto se
aplica mediante una acción aparte; la prueba lo omite explícitamente tras
éxito. **No existe en esta prueba una exclusión automática del efecto por
haber superado la salvación**, ni se simula que exista.

### Requisito de las fichas y alcance

Se reutilizan los dos actores `extended-*` y se crean dos fichas enlazadas en
la escena QA `m3uZm106sxh6OJut`. Se visualiza esta escena para el GM, sin
activarla para los jugadores; al terminar se restaura la vista anterior.
El primer ensayo con la escena sin visualizar no pudo construir el control
de daño: el resolvedor de objetivos devolvía el actor sin el objeto de ficha
del lienzo. Visualizar la escena resolvió el problema de preparación de la
prueba, sin modificar el sistema ni la traducción.

La inspección del código instalado confirma la separación de responsabilidades:
`UsageMessageData.outcomes` asocia las salvaciones por UUID de ficha;
`DamageApplicationElement.getMergedOptions` calcula el multiplicador;
`_onApplyDamage` modifica los PG; `EffectApplicationElement._onApplyEffects`
aplica los efectos a los objetivos seleccionados. Fuentes en
`systems/dnd5e/dnd5e.mjs`, líneas 72937, 73015, 73367, 73904 y 88158,
SHA-256 `09dd3d9d373abc45c5f873a22426f2306cca981ff5c8bf623c6646980d01936c`.

La cobertura es de integración de los manejadores del chat, no una simulación
completa mediante clics ni una prueba multijugador. No incluye el ataque que
dispara el veneno, expiración temporal, inmunidades, resistencias, selección
de varios objetivos ni módulos de automatización adicionales.

Macro **QA - DM salvaciones**: importar el auxiliar y ejecutar
`await qa.saveWorkflow();`. Requiere haber ejecutado `extendedItems()` una vez
para preparar los encantamientos QA. Las tarjetas son privadas para el GM.
Los efectos creados quedan desactivados y los actores vuelven a 20 PG.
Se conservan escena, fichas y macro para repetir la prueba; no se avanza tiempo.
Evidencias locales ignoradas: `tmp/functional-save-workflow.json` y
`tmp/functional-save-workflow-final-state.json`. Esta última confirma ausencia
de escena activa o visualizada, partida en pausa y ningún efecto QA activo.
Tras recargar se verificaron **cero módulos activos** y la partida en pausa.

## Seguimiento: duración y expiración del veneno

El **29 de septiembre de 2026, 00:03:32 de Madrid** (28 de septiembre,
22:03:32 UTC), `effectExpiry()` pasó **16 casos**, sin errores, con las mismas
versiones de Foundry, dnd5e y módulos del seguimiento anterior.

Se probaron la condición de envenenado y el encantamiento de recubrimiento,
en original y traducido. Los cuatro efectos conservan la configuración
oficial: `value: 60`, `units: 'seconds'`, `expiry: 'turnStart'`.

| Caso, repetido en los cuatro efectos | Resultado |
|---|---|
| 59 segundos transcurridos, inicio del turno correspondiente | Queda 1 segundo; efecto activo |
| 60 segundos transcurridos, inicio del turno del otro combatiente | Quedan 0 segundos; efecto todavía activo |
| 60 segundos transcurridos, evento de inicio de ronda | Efecto todavía activo |
| 60 segundos transcurridos, inicio del turno correspondiente | `duration.expired: true`, efecto inactivo y documento conservado |

La expiración de la condición retiró `poisoned` del actor; la del recubrimiento
restauró la imagen original de la daga. No fue necesario modificar la traducción
ni los perfiles oficiales. El resultado refleja **duración cumplida más evento
de expiración**, no una caducidad incondicional al llegar a cero segundos.

### Método y límites

La macro utiliza un encuentro QA real con los dos actores `extended-*`, sin
activarlo, y una instancia independiente de `ActiveEffectRegistry` que contiene
exclusivamente el efecto bajo prueba. Llama a su método real `refresh`, que
calcula la duración y persiste la expiración. Requiere que la configuración
instalada sea `CONFIG.ActiveEffect.expiryAction === 'update'`.

Para alcanzar los límites de 59 y 60 segundos se ajusta exclusivamente la fecha
de inicio del efecto QA. Se prepara el turno del encuentro con
`turnEvents: false` y se envía explícitamente el evento que se desea comprobar.
**No se avanza el reloj mundial ni se pulsan diez rondas de combate**. Esto
valida la integración del cálculo y del gestor de expiración con los documentos,
pero deja fuera la emisión de eventos desde los botones de siguiente turno,
la sincronización multijugador y la expiración fuera de combate.

En esta prueba, el combatiente registrado en `start.combatant` es también el
propietario del efecto. El caso de origen y objetivo distintos se comprueba
en el seguimiento siguiente. Tampoco se prueba aquí la retirada del
recubrimiento después de un impacto.

Fuentes locales inspeccionadas: Foundry 14.368,
`client/documents/active-effect.mjs` (`updateDuration`, `isExpiryEvent`) y
`client/helpers/active-effect-registry.mjs` (`refresh`). SHA-256 respectivos:
`d1a54e77819a393513237cd9a5823444f9dca9180d3d54b8e069dafe071e085c` y
`d1f41e75dd8c6b7f9fa3c21829186608c408545820c36004aac2a64f41017f27`.
Las copias de lectura permanecen en `tmp/` ignorado; no se distribuyen.

Macro **QA - DM caducidad**: importar el auxiliar y ejecutar
`await qa.effectExpiry();`. Requiere preparar previamente los encantamientos
con `extendedItems()`. Evidencia: `tmp/functional-effect-expiry.json`.
Se conserva el encuentro `JXszEuIq2arCVMVi`, sin iniciar ni activar, y las
condiciones QA desactivadas. Se restauran los datos de duración e inicio de
los efectos, y se comprueba que ambos actores siguen con 20 PG y sin veneno.
La evidencia confirma el reloj sin cambios y la partida en pausa.
Al terminar se recargó Foundry y se verificaron cero módulos activos y la pausa.

## Seguimiento: origen y objetivo distintos

El **29 de septiembre de 2026, 00:25:54 de Madrid** (28 de septiembre,
22:25:54 UTC), `crossActorExpiry()` pasó **4 casos** con las mismas versiones.
Se intercambiaron los papeles de los dos actores QA: uno usa la daga y el otro
recibe envenenado. El portador de la daga no recibe la condición.

| Versión de la daga | Aplicación | Referencia de inicio y expiración | Operación observada |
|---|---|---|---|
| Original | Durante el turno del atacante | Combatiente atacante | Crear efecto en el receptor |
| Original | Reaplicación durante el turno del receptor | Combatiente receptor | Actualizar el mismo efecto |
| Traducida | Durante el turno del atacante | Combatiente atacante | Crear efecto en el receptor |
| Traducida | Reaplicación durante el turno del receptor | Combatiente receptor | Actualizar el mismo efecto |

En los cuatro casos se verificó que el efecto permanece activo a los 59 segundos
y también a los 60 durante el turno distinto del registrado. Al inicio del
turno registrado, con 60 segundos cumplidos, expira y desaparece `poisoned`.
Las reaplicaciones conservaron los IDs de los efectos y renovaron su inicio.

**Consecuencia para el GM:** el turno en curso al aplicar el efecto determina
`start.combatant`. Aplicarlo después de cambiar de turno puede cambiar también
la referencia de expiración. No debe interpretarse `turnStart` como «inicio del
turno del receptor» en todos los casos. Este comportamiento proviene del sistema
instalado y coincide en original y traducción; no se alteraron sus datos.

La prueba usa tarjetas privadas reales y el método de aplicación del componente
de chat (`EffectApplicationElement._applyEffectToActor`), que prepara y crea o
actualiza los efectos del receptor. El inicio se obtiene del sistema; la prueba
no escribe el combatiente de referencia para forzar el resultado. Después solo
ajusta `start.time` para comprobar 59/60 segundos mediante el gestor real de
expiración, aislado al efecto QA. No se avanza el reloj ni se usan los botones
de cambio de turno: siguen fuera del alcance la emisión automática de eventos,
las reacciones, la salida del combate y la sincronización multijugador.

Macro **QA - DM veneno entre actores**: importar el auxiliar y ejecutar
`await qa.crossActorExpiry();`. Requiere `extendedItems()` y `effectExpiry()`
previos para disponer de las muestras y el encuentro QA sin iniciar.
Evidencia local ignorada: `tmp/functional-cross-actor-expiry.json`.
Al finalizar se desactivaron los dos efectos creados y los recubrimientos;
el combate quedó sin iniciar ni activar, con ambos actores a 20 PG y sin veneno.
El reloj mundial no cambió y la partida permaneció en pausa.
Tras recargar se verificaron cero módulos activos y la partida en pausa.

## Reproducción y evidencias

Herramienta: [validate-functional.mjs](validate-functional.mjs), de uso explícito
en desarrollo y excluida del ZIP instalable. Requiere las exportaciones inglesas
locales en `dev-tools/export/data/`, los siete JSON de traducción, la carpeta
local `tmp/` y permisos de GM para guardar evidencia mediante el FilePicker.
No contiene los textos originales exportados.

1. Usar el mundo desechable `testing` y activar las dependencias de la tabla.
2. Seleccionar español y recargar; importar el capítulo 3 con los IDs originales
   según [ENLACE-SANTUARIO.md](ENLACE-SANTUARIO.md).
3. Ejecutar la macro **QA - DM funcional**, de tipo Script:

```js
const qa = await import(
  '/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/validate-functional.mjs'
);
await qa.catalog();
await qa.documents();
await qa.items();
await qa.investigate();
```

La herramienta rechaza otros mundos, usuarios sin permisos de GM y dependencias
inactivas. Crea/reutiliza muestras propias, reinicia sus recursos de prueba y
conserva sus documentos para inspección. `investigate()` reproduce el hueco
conocido de la tabla y puede mostrar avisos de Foundry por ausencia de resultado.
No es una macro para ejecutarse durante una partida real.

Evidencias locales ignoradas en `tmp/`:

- `functional-catalog.json`: catálogo, 125 tablas y observación de rangos.
- `functional-documents.json`: 3 diarios, 5 tablas y tirada recursiva; 9 casos correctos.
- `functional-items.json`: 12 comprobaciones correctas.
- `functional-investigation.json`: reproducción de los cinco resultados ausentes.

Los archivos completos son locales y no se publican con el módulo. Este informe
conserva los resultados e identificadores sin distribuir exportaciones oficiales.
También pasaron las **25 pruebas Node existentes, sin omisiones**, y la
comprobación de sintaxis `node --check dev-tools/translation/validate-functional.mjs`.

Al terminar se restauró el estado inicial de **cero módulos activos** y se
recargó el mundo, que permanece en pausa. Se conservan los tres diarios, cinco
tablas, dos actores QA, sus efectos de velocidad aplicados desactivados y la macro, además del capítulo
3 y la macro del santuario anteriores. Para repetir o examinar las fichas con
todas sus funciones, hay que reactivar los módulos indicados.
