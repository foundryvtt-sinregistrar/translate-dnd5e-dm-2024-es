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
