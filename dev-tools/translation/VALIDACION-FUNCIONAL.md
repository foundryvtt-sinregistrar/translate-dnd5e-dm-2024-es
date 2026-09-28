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

No se probaron el veneno y la salvación de la daga, todos los niveles y objetivos
del conjuro de la varita, recuperaciones en descansos, agotamiento/destrucción,
duraciones en combate, todos los efectos, permisos de jugadores, escenas,
bastiones completos ni todas las combinaciones de módulos.

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
