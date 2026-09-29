# Ampliación de validación — 29 de septiembre de 2026

Foundry 14.368, dnd5e 6.0.3, DMG 2.0.0, PHB 2.2.0, MM 1.4.0, Babele 2.9.1,
Foundry español 14.368.1, libWrapper 1.13.5.1 y ravanno español 6.0.3 con el
ajuste local documentado. Mundo `testing`, GM, partida en pausa.

## Catálogo y escenas

El catálogo posterior a las correcciones pasó sobre **873 documentos y 3468
enlaces**, sin errores. Se importaron tres escenas:

| Escena | Paredes | Regiones | Destinos resueltos | Imagen |
| --- | ---: | ---: | ---: | --- |
| Torreón | 764 | 19 | 19 | HTTP 200 |
| Posada junto al camino | 224 | 6 | 6 | HTTP 200 |
| Casa espeluznante | 409 | 8 | 7 | HTTP 200 |

Se compararon etiquetas, geometría, fondo, rejilla, paredes, dibujos y mecánicas
de regiones con el compendio. Se excluyen únicamente las marcas de auditoría
`_stats` y se normaliza la conversión de destinos absolutos a relativos que
efectúa Foundry al importar. Cada destino se resuelve por UUID y se exige que
pertenezca a la escena importada.

**Requisito del Torreón:** importar conservando el ID `dmgKeep000000000`.
La importación con ID nuevo dejó 18 destinos absolutos que apuntaban al ID
oficial ausente. Con `keepId: true` resolvieron los 19 destinos. El auxiliar
rechaza sobrescribir una escena existente con ese ID. No se cambian las
referencias mecánicas de la traducción para encubrir el requisito.

Foundry activó automáticamente la primera escena importada porque el mundo
carecía de escena activa; se desactivó y se añadió restauración explícita al
auxiliar. Se conserva una copia de la primera importación para diagnóstico,
además de las tres importaciones que pasaron. Evidencias anteriores:
`tmp/functional-completion-first-run.json` y `tmp/functional-completion-new-ids.json`.

No se simuló el desplazamiento de una ficha a través de todas las regiones;
resolver un destino no certifica todos los comportamientos de teletransporte,
alturas, visión y luces de una escena.

## Bastión y permisos

Se crearon dos copias QA de Estudio arcano, una original y otra traducida.
En ambas, usando `game.dnd5e.bastion.advanceTurn` y actualizaciones reales:

- Una instalación desactivada se reparó al avanzar un turno.
- Una instalación especial sin orden se mantuvo.
- Una fabricación de 14 días progresó a 7 en el primer turno y se completó en
  el segundo, devolviendo una poción de curación y restableciendo el progreso.
  Los resultados fueron iguales en original y traducción.

Se restauraron `disabled`, `progress` y `craft` de las copias. El reloj no avanzó.
Se comprueba el resultado de fabricación, no la reclamación del objeto mediante
chat ni el gasto completo de recursos de un personaje; tampoco todas las
instalaciones y órdenes de bastión.

Se verificaron los cuatro niveles de propiedad (0–3) contra
`Actor.testUserPermission`, usando un jugador y actores creados solo en memoria.
Las combinaciones de LIMITED, OBSERVER y OWNER fueron las esperadas. No se creó
una cuenta ni se inició sesión como jugador: queda pendiente esa comprobación
de interfaz con permisos reales.

## Dos clientes y presentación

Dos pestañas de Chrome se conectaron como el mismo GM. La segunda mostró en
el directorio de objetos el cambio de nombre de una instalación QA a
«QA - DM cierre - sincronización verificada» y su restauración a
«QA - DM cierre - translated», sin recargar. Se cerró la segunda pestaña.
Esto acredita esa actualización entre clientes, no una partida entre GM y
jugador ni todos los efectos de combate.

En la ficha de Botas de velocidad se abrió ACTIVIDADES y se comprobó visualmente
**Entrechocar los talones**. Las seis descripciones se revisaron después; véase
[REVISION-LINGUISTICA.md](REVISION-LINGUISTICA.md). El catálogo completo se
volvió a validar tras esa edición, sin errores ni enlaces pendientes.

## Reproducción y resultado

```js
const qa = await import(
  '/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/validate-completion.mjs'
);
await qa.validateCompletion();
```

Requiere las dependencias activas, español y exportaciones originales locales.
No usar fuera de `testing`. Conserva las muestras para inspección. Resultado:
**14 comprobaciones correctas y cero errores**, con reloj, escena activa,
número de usuarios y pausa sin cambios. Evidencia:
`tmp/functional-completion.json` (06:37:00 UTC). La prueba manual del segundo
cliente no se incluye en ese contador.

El catálogo final de las 06:43:29 UTC volvió a comprobar los 873 documentos,
sin errores ni enlaces pendientes, después de las seis descripciones y el
cambio de nombre de la daga. Al terminar se agruparon las muestras en carpetas
**QA - DM cierre 2026-09-29**, se restauraron el comando de la macro y los cero
módulos activos y se recargó. El mundo quedó en pausa, con reloj 0 y sin escena
activa. Registro local: `tmp/completion-restored.json`.

## Clon aislado y paquete extraído

El commit `a077a65` se clonó en un directorio temporal sin exportaciones privadas
ni módulos hermanos. Pasaron 18 pruebas Node portables y las 24 pruebas Python
del constructor; las otras siete Node se omitieron explícitamente porque
requieren fuentes privadas. Esas siete sí pasaron en el repositorio de trabajo.
Se construyeron los cuatro artefactos de desarrollo y se extrajo el ZIP: todas
las rutas de ejecución del manifiesto existen y las herramientas y pruebas
quedan excluidas. Evidencia: `tmp/clean-review-validation.json`.

Esta comprobación no equivale a instalar o actualizar desde la pantalla Setup
de Foundry. Tampoco constituye una nueva release: el manifiesto sigue en 0.1.1.

## Revalidación de actores y escenas

El segundo lote lingüístico pasó de nuevo en Foundry a las **07:12:11 UTC**:
873 documentos, 3468 enlaces, cero errores y cero destinos pendientes.
Evidencia conservada: `tmp/actor-scenes-validation.json`. Pasaron también las
25 pruebas Node con originales y la auditoría de los siete compendios.
Se restauró la macro y se verificó la interfaz en pausa y con cero módulos activos.

El arranque sigue registrando un error de dnd5e 6.0.3 en `renderCombatTracker`
al acceder a `getGroupingKey` desde un valor nulo en este mundo QA; aparece tanto
sin módulos como con las dependencias. No impidió la validación del catálogo.
Se reprodujo posteriormente con dos combatientes sin ficha y se documentó la
causa en [DIAGNOSTICO-PANEL-COMBATE.md](DIAGNOSTICO-PANEL-COMBATE.md).
No se atribuye a estos cambios de traducción ni se declara resuelto.

## Revalidación del lote de tablas

El **29 de septiembre de 2026, 07:37:49 UTC**, pasaron nuevamente los 873
documentos y 3468 enlaces tras las 832 correcciones del lote de tablas y nombres:
cero errores y cero destinos pendientes. Evidencia: `tmp/tables-review-validation.json`.
Las 25 pruebas Node y la auditoría de originales también pasaron. Se restauraron
la macro y la configuración anterior y se recargó el mundo.

La revisión semántica detectó que una etiqueta de Cuerno de Valhalla en
Reliquias muy raras abre una figurilla de grifo: el UUID ya es erróneo en DMG
2.0.0. Se conserva y documenta en [REVISION-LINGUISTICA.md](REVISION-LINGUISTICA.md).
Un enlace resuelto no garantiza que su etiqueta describa correctamente el destino.

## Revalidación del primer lote amplio de equipo

El **29 de septiembre de 2026, 08:04:31 UTC**, pasaron los 873 documentos,
sin errores ni enlaces sin resolver, después de las 179 correcciones de equipo
y las cuatro correcciones de acentos en tablas y bastiones. Evidencia local:
`tmp/equipment-review-1-validation.json`. Las 25 pruebas Node y la auditoría de
los siete compendios también pasaron. La revisión lingüística de equipo sigue
siendo parcial; este resultado valida la aplicación del lote por Babele.

## Revalidación del tercer lote amplio de equipo

El **29 de septiembre de 2026, 08:39:25 UTC**, pasaron los 873 documentos,
sin errores ni enlaces sin resolver, tras las 182 correcciones de equipo y
cinco etiquetas de tablas/diarios. Evidencia local:
`tmp/equipment-review-3-validation.json`. Pasan también las 25 pruebas Node y
la auditoría de los siete compendios. Se restauró la macro original y se
verificó el mundo en pausa con cero módulos activos. La revisión editorial
sigue abierta; estas comprobaciones no certifican todos los textos del libro.
