# Etiqueta «Undefined criaturas» — diagnóstico del 28 de septiembre de 2026

**Estado actual:** parche de parámetros y ajuste de concordancia aplicados a la
copia local de `ravanno-dnd5e-es`, comprobados tras recargar Foundry. La tarjeta
de la poción muestra **Cualquier criatura**. Las secciones iniciales conservan
el diagnóstico previo; aplicaciones, respaldos y reversión se detallan al final.

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

**Límite del primer parche:** eliminar el parámetro incorrecto no corrige por sí solo
la concordancia de frases como «Cualquiera criaturas» o «uno criatura». Estas
requieren revisar cómo el sistema compone cantidades y sustantivos en español;
no se presenta el parche técnico como una revisión gramatical completa.
El ajuste de presentación descrito al final resuelve estos casos por separado.

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

## Concordancia: ajuste local de presentación

El seguimiento del **28 de septiembre de 2026, 20:54 UTC**, corrigió las
combinaciones «Cualquiera criaturas», «Todos criaturas» y «uno criatura».
El diccionario ya incluye frases completas correctas para cada tipo (`any` y
`every`). El ajuste las utiliza en las etiquetas sin cantidad definida y emplea
el numeral **1** en las descripciones singulares, evitando adivinar el género
de un nombre o de un objetivo especial escrito por el usuario.

| Situación | Resultado comprobado |
|---|---|
| Criaturas sin cantidad definida | Cualquier criatura |
| Criaturas afectadas por una plantilla de área | Todas las criaturas |
| Una criatura | 1 criatura |
| Objetivo especial «estatua», cantidad 1 | 1 estatua |
| Objetivo especial «estatuas», cantidad 2 | dos estatuas |

Se instaló una copia de [target-labels-es-6.0.3.mjs](target-labels-es-6.0.3.mjs)
en `ravanno-dnd5e-es/`, importada desde su `babele-register.js`. El código usa
libWrapper para ajustar el resultado de `TargetField.getLabels`; no modifica
el código de dnd5e. Solo se registra en **dnd5e 6.0.3** y solo modifica etiquetas
en español. Conserva cantidades, objetivos, plantillas y reglas.

El adaptador requiere el parche anterior de 38 claves. No se distribuye como
parte del módulo DM: el archivo versionado aquí permite revisar y reproducir
la corrección local de la dependencia. El resto de idiomas pasa por el método
original sin cambios. En otra versión de dnd5e el adaptador no se registra;
hay que revisar si todavía es necesario antes de ampliar esa condición.

### Comprobaciones y reproducción

Tras recargar con los cuatro módulos de idioma/dependencias activos, pasaron
**46 casos**: tipos individuales con cantidades vacías, uno y dos; tipos de
área con una y dos plantillas; dos objetivos especiales. Se exigió coincidencia
de las etiquetas previstas, ausencia de `undefined`/`uno`/`cualquiera`
incorrectos y conservación exacta de los datos de entrada. Se comprobó además
que la función de ajuste conserva un resultado inglés sin alterarlo; no fue
una sesión completa de pruebas con la interfaz en inglés.

La tarjeta existente de la poción se volvió a renderizar y mostró
**Cualquier criatura**. No se consumieron más objetos ni se crearon nuevas
tiradas durante este seguimiento. El alcance es la concordancia de las
etiquetas de objetivos; no incluye una revisión de todas las unidades, frases
o traducciones del sistema.

Macro guardada: **QA - Concordancia de objetivos**.

```js
const {validateTargetGrammar} = await import(
  '/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/validate-target-grammar.mjs'
);
await validateTargetGrammar();
```

Evidencia local: `tmp/target-grammar-validation.json`, **20:55:42 UTC**.
Las comprobaciones de sintaxis de ambos archivos `.mjs` también pasaron.
Después se restauraron los cero módulos activos de Testing y se recargó el
mundo, que permanece en pausa. La corrección local se mantiene instalada.

### Respaldo y reversión del ajuste de presentación

Antes de añadir la importación se guardó el archivo original completo en
`tmp/ravanno-babele-register-before-grammar-f03ce444bac1.js`. El registro
`tmp/target-grammar-application.json` contiene rutas y SHA-256 del archivo
anterior, posterior y del adaptador instalado. La copia versionada del adaptador
y la instalada se comprobaron idénticas.

Para retirar solo este ajuste, verificar los hashes y restaurar ese respaldo
como `ravanno-dnd5e-es/babele-register.js`; recargar Foundry. El adaptador deja
de cargarse aunque su archivo siga en la carpeta. Esto conserva la corrección
de `{number}` en el diccionario. Para revertir también esa corrección, utilizar
el respaldo de `es.json` descrito antes. Revisar primero cualquier modificación
posterior para no sobrescribir trabajo nuevo. Una actualización de la dependencia
puede reemplazar el punto de importación o el diccionario: ambos ajustes son locales.
