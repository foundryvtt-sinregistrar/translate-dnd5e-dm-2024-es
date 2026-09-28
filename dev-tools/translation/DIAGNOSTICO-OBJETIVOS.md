# Etiqueta «Undefined criaturas» — diagnóstico del 28 de septiembre de 2026

**Estado actual:** parche aplicado a la copia local de `ravanno-dnd5e-es` y
comprobado tras recargar Foundry. Las secciones iniciales conservan el diagnóstico
previo; la aplicación y su respaldo se detallan al final.

## Causa confirmada

La cadena observada en la tarjeta de la poción procede del diccionario instalado
de **ravanno-dnd5e-es 6.0.3**, no de la traducción de DM ni de los datos de la
poción. El código local de **dnd5e 6.0.3**, en `TargetField.getLabels`, localiza
el tipo de objetivo y después añade su cantidad con `DND5E.TARGET.Formatted`.
La primera operación recibe `special`, pero no recibe `number`.

El diccionario español incluye `{number}` en claves que ya no lo tienen en el
original inglés. Por ejemplo:

| Clave bajo `DND5E.TARGET.Type.Creature.Counted` | Inglés instalado | Español instalado | Sustitución propuesta |
|---|---|---|---|
| `one` | `creature` | `{number} criatura` | `criatura` |
| `other` | `creatures` | `{number} criaturas` | `criaturas` |

Foundry sustituye el parámetro ausente por `undefined`. La cantidad válida se
añade después: de ahí **Cualquiera undefined criaturas** o **1 undefined criatura**.
Cambiar la descripción o el objetivo mecánico de la poción no corrige esa causa.

## Prueba en Foundry

Se ejecutó [validate-target-labels.mjs](validate-target-labels.mjs) en **Testing**
(`testing`), Foundry **14.368** y dnd5e **6.0.3**, como GM. Se utilizó el método
real `game.dnd5e.dataModels.shared.TargetField.getLabels`, con tres diccionarios:
original inglés, español instalado y español con las sustituciones propuestas.

| Diccionario | Casos | Casos con `undefined` o `{number}` sin sustituir |
|---|---:|---:|
| Inglés de dnd5e instalado | 45 | 0 |
| Español de ravanno instalado | 45 | 45 |
| Español con el parche propuesto | 45 | 0 |

La muestra recorre los tipos individuales configurados con cantidad vacía,
uno y dos; tipos de área con una y dos plantillas; y un objetivo especial.
Un caso se considera afectado si falla cualquiera de sus etiquetas derivadas,
no necesariamente todas. Es una prueba de generación de etiquetas, no 45
consumos de poción ni 45 tiradas de combate.

Ejemplos obtenidos:

| Caso | Antes | Después |
|---|---|---|
| Criaturas, cantidad no especificada, ficha | Cualquiera undefined criaturas | Cualquiera criaturas |
| Una criatura, ficha | 1 undefined criatura | 1 criatura |
| Dos criaturas, descripción | dos undefined criaturas | dos criaturas |

**Límite lingüístico:** eliminar el parámetro incorrecto no corrige por sí solo
la concordancia de frases como «Cualquiera criaturas» o «uno criatura». Estas
requieren revisar cómo el sistema compone cantidades y sustantivos en español;
no se presenta el parche técnico como una revisión gramatical completa.

La prueba mantuvo **cero módulos activos**. Leyó ambos diccionarios locales,
los cargó temporalmente en memoria y restauró el diccionario original en un
bloque `finally`, sin operaciones asíncronas durante la sustitución. No cambió
ajustes, datos de actores, objetos, chat ni archivos del módulo de idioma.
El mundo permanece en pausa. Se añadió únicamente la macro
**QA - Diagnóstico etiquetas de objetivos**.

## Parche preparado para la dependencia

[target-labels-6.0.3.patch.json](target-labels-6.0.3.patch.json) contiene **38
sustituciones** de claves de `DND5E.TARGET.Type.*.Counted.one/other`. Elimina
exclusivamente el prefijo `{number} ` cuando la clave inglesa equivalente no lo
usa. Conserva `{special}` y las variantes `oneSized`/`otherSized`, que sí pueden
necesitar cantidades. Hay 19 tipos en el mapa; algunos no corresponden a tipos
configurados directamente en la matriz de pruebas.

Es un mapa de clave completa a valor para el diccionario de **ravanno-dnd5e-es**.
En la primera comprobación solo se aplicó temporalmente en memoria; posteriormente
se integró en la copia local, como se detalla abajo. No se carga desde la traducción
de DM. No se envió ninguna incidencia o cambio al repositorio externo.

Para integrarlo en la dependencia:

1. Trabajar sobre la versión correspondiente de `ravanno-dnd5e-es` y conservar
   una copia o commit del diccionario original.
2. Sustituir los valores de las 38 rutas indicadas dentro de `lang/es.json`;
   las rutas completas corresponden al árbol JSON, no a nuevas claves duplicadas.
3. Comprobar la sintaxis y ejecutar el diagnóstico con
   `{patchedInstallation: true}` después de activar el módulo y recargar.
4. Activar la traducción del sistema y verificar la tarjeta de una poción tras
   recargar. Estos pasos ya se realizaron en la instalación local descrita abajo.

## Reproducción del diagnóstico sin instalar el parche

Desde una macro Script, como GM en `testing`, con los diccionarios originales
instalados y la carpeta local `tmp/` disponible:

```js
const {validateTargetLabels} = await import(
  '/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/validate-target-labels.mjs'
);
await validateTargetLabels();
```

El auxiliar limita la versión de sistema a 6.0.3 y comprueba los textos de origen
antes de aplicar el mapa en memoria. Evidencia local ignorada:
`tmp/target-labels-validation.json`, generada el 28 de septiembre de 2026 a las
20:09:50 UTC. Contiene las tres salidas de cada caso y confirma la restauración.
También pasó `node --check dev-tools/translation/validate-target-labels.mjs`.

## Aplicación local y comprobación tras recarga

El 28 de septiembre de 2026 a las **20:15:47 UTC** se modificó únicamente
`Data/modules/ravanno-dnd5e-es/lang/es.json`. Se sustituyeron las **38 claves**
previstas conservando el formato del archivo; la comparación de los JSON
confirmó que ningún otro valor cambió. El módulo conserva su versión declarada
6.0.3: se trata de una corrección local, no de una nueva versión publicada.

Antes de escribir se guardó una copia íntegra del archivo original en:

`tmp/ravanno-es-before-target-labels-fd77438f938d.json`

Trazabilidad local en `tmp/target-labels-application.json`:

| Archivo | SHA-256 |
|---|---|
| Original y respaldo | `fd77438f938d9a2ceb67ab1c64b181b1d7e6332a5c0892cf6e9f0c4dfb274271` |
| Corregido | `7753cee4b90d991718c69b9522fa415225abd89287c52fdc25bcc243398251d1` |

Tras activar **Babele, libWrapper, Español de Foundry y ravanno-dnd5e-es**, se
recargó el mundo. Se comprobó que las 38 claves de `game.i18n` coincidían con el
archivo corregido y que los **45 casos ejecutados contra el diccionario activo**
no contenían `undefined` ni parámetros sin resolver. Este chequeo ocurre antes
de cualquier sustitución temporal del comparador.

La macro guardada **QA - Diagnóstico etiquetas de objetivos** utiliza ahora:

```js
const {validateTargetLabels} = await import(
  '/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/validate-target-labels.mjs'
);
await validateTargetLabels({patchedInstallation: true});
```

En este modo, la columna «antes» se reconstruye a partir del mapa validado para
comparar el defecto; la columna `live` recoge el resultado del diccionario
realmente cargado. La prueba previa con el archivo original sigue conservada
en su informe separado. Evidencia posterior:
`tmp/target-labels-installed-validation.json`, **20:17:27 UTC**, 45 casos y cero
fallos en `live`.

Se usó la poción del actor QA traducido desde su inventario. La tarjeta nueva
mostró **Cualquiera Criaturas**, sin `Undefined`, y la tirada de curación dio
**9**. La concordancia sigue pendiente; el parche solo corrige el parámetro
incorrecto. El objeto fue consumido en el actor de pruebas; no se aplicó la
curación a otros actores. Los productos oficiales y la traducción de DM no
estaban activos: se utilizó la muestra previamente importada.

Al terminar se restauraron los **cero módulos activos** del mundo y se recargó,
manteniendo la partida en pausa. El parche permanece en el archivo de idioma;
se carga al activar ese módulo. Una actualización de `ravanno-dnd5e-es` puede
sustituirlo: revisar primero si la versión nueva ya corrige esas claves.

Para revertir la corrección local, comparar primero el archivo actual con el
hash corregido indicado arriba. Si coincide y no hay cambios posteriores que
conservar, restaurar el respaldo en `ravanno-dnd5e-es/lang/es.json` y recargar
Foundry. El respaldo y los informes están ignorados y no se incluyen en el ZIP
de DM. El commit de DM guarda la propuesta, el validador y la documentación;
la copia instalada de la dependencia está fuera de ese repositorio.
