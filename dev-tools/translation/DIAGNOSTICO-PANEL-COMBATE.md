# Icono de veneno persistente en el panel de combate

## Resultado

El 29 de septiembre de 2026, a las 07:54 de Madrid, se reprodujo el icono
persistente con **Foundry 14.368, dnd5e 6.0.3 y cero módulos activos** en el
mundo `testing`. La diferencia determinante en esta muestra fue la asociación
del combatiente a una ficha (`TokenDocument`).

| Combatiente | Condición tras expirar | Iconos tras expirar | Tras refresco explícito |
| --- | --- | --- | --- |
| Solo actor, sin ficha | Inactiva; actor sin `poisoned` | 1 | 0 |
| Mismo actor y efecto, con ficha vinculada | Inactiva; actor sin `poisoned` | 0 | 0 |

Pasaron las dos comprobaciones. La traducción DM y sus dependencias no son
necesarias para reproducir el problema. El encuentro usado en la prueba previa
de **Turno siguiente** contenía combatientes sin ficha, lo que explica la
observación visual de esa muestra. La condición sí expiraba correctamente.

## Causa y solución práctica

La inspección del código instalado muestra este recorrido al actualizar un
efecto del actor: `Actor._onUpdateDescendantDocuments` llama a
`_onEmbeddedDocumentChange`, que actualiza las fichas dependientes. En
`TokenDocument._onRelatedUpdate`, el panel se vuelve a renderizar si la ficha
tiene un combatiente. Su búsqueda usa `tokenId`; un combatiente asociado solo
al actor no participa en esa ruta de refresco.

El panel obtiene los iconos de `actor.appliedEffects` al renderizarse. Por eso
un refresco explícito retira el icono obsoleto sin modificar el efecto.

Para las pruebas y los encuentros habituales, añadir al combate las fichas
de la escena. Si se mantiene un encuentro QA sin fichas, una macro Script de
GM puede refrescar el panel después de la expiración:

```js
await ui.combat.render({force: true});
```

Es una mitigación visual para esa configuración. No se ha modificado Foundry,
dnd5e ni el código de ejecución del módulo DM, ni se ha añadido un hook global.
El defecto de refresco para combatientes sin ficha permanece en esta versión.

## Método y repetición

Auxiliar explícito: [diagnose-combat-tracker.mjs](diagnose-combat-tracker.mjs).
Requiere ser GM en `testing`, las versiones anteriores y cero módulos activos.
Reutiliza las muestras restauradas de las pruebas de salvaciones y veneno
entre actores: actor original, efecto `qa-cross-expiry`, escena
`save-workflow` y encuentro `effect-expiry`, sin iniciar ni activar.

Ejecutar desde una macro Script:

```js
const qa = await import(
  '/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/diagnose-combat-tracker.mjs'
);
await qa.diagnoseTracker();
```

El auxiliar compara el mismo actor y efecto con `tokenId` ausente y presente.
En cada caso activa el efecto, renderiza el estado inicial, persiste
`duration.expired: true`, espera el refresco y mide los iconos de la fila.
Después fuerza un render para comparar. Esta prueba aísla **la actualización
visual tras persistir la expiración**; no sustituye a la prueba anterior de
los botones y del registro automático de efectos.

La evidencia local ignorada `tmp/combat-tracker-diagnostic.json` registra
dos casos correctos, sin errores del auxiliar. La restauración dejó el reloj
sin cambios, el efecto desactivado, el actor con 20 PG y sin veneno, el encuentro
sin iniciar ni activar, la asociación de ficha original y la partida en pausa.
Se restauró también el comando de la macro usada temporalmente para ejecutar
el diagnóstico. No se cubren fichas no vinculadas, varios clientes ni otras
versiones. No se afirma ausencia de avisos ajenos en la consola.

## Error adicional de agrupación sin ficha

El 29 de septiembre, a las **07:44:11 UTC**, se reprodujo el error de
`getGroupingKey` con cero módulos activos. Dos combatientes QA sin ficha y con
iniciativa (20 y 19) provocaron el acceso a un valor nulo. El método de dnd5e
6.0.3 llama a `this.token.getGroupingKey(...)` sin comprobar que exista la ficha
cuando está activada la agrupación y hay iniciativa.

El auxiliar [diagnose-combat-grouping.mjs](diagnose-combat-grouping.mjs) compara
cada combatiente con una copia temporal en memoria sin iniciativa. Las dos
copias devolvieron `null` correctamente: **dos casos, cero errores del
diagnóstico y documento del encuentro sin cambios**. Evidencia local:
`tmp/combat-grouping-diagnostic.json`. Se restauró el comando de la macro.

Usar combatientes asociados a fichas evita esta configuración. Para un ensayo
sin fichas se puede dejar la iniciativa vacía; aquí se comprobó únicamente
el método sobre copias en memoria, no todo el recorrido visual del panel.
No se alteraron iniciativas persistentes, ajustes globales ni el sistema.
El defecto permanece en dnd5e 6.0.3 y no se añade un parche al módulo DM.

Fuente instalada: `systems/dnd5e/dnd5e.mjs`, método `getGroupingKey`, líneas
92676–92679; SHA-256
`09dd3d9d373abc45c5f873a22426f2306cca981ff5c8bf623c6646980d01936c`.

## Fuentes locales

Inspeccionadas en el contenedor instalado; las copias de referencia quedan en
`tmp/` y no se distribuyen con el repositorio ni con el ZIP:

- `foundry-actor-14.368.mjs`: métodos de actualización de documentos y fichas
  dependientes, líneas 727–775. SHA-256:
  `e82580bf9cef39d934c972dee859a3b9ba7ab5f3ebdc7502319dfed1bc214bb3`.
- `foundry-token-14.368.mjs`: búsqueda de combatiente por ficha y
  `_onRelatedUpdate`, especialmente líneas 3815–3824. SHA-256:
  `44b8f03c161d8f077991167d652924228fe2f88b2b47ef4354b98df1a83feba7`.
- `foundry-combat-tracker-14.368.mjs`: selección de efectos para los iconos,
  líneas 295–306. SHA-256:
  `8295414e5901160ace7bfd958a5ef85a9f1a39eb10ceb56b021facfa464706e0`.
