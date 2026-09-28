# Etiqueta «Undefined criaturas» — diagnóstico del 28 de septiembre de 2026

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

Es un mapa de clave completa a valor, preparado para integrar en el diccionario
de **ravanno-dnd5e-es**. **No está aplicado a la instalación ni se carga desde
la traducción de DM.** No se envió ninguna incidencia o cambio al repositorio
externo. Se conserva aquí como material de diagnóstico y propuesta revisable.

Para integrarlo en la dependencia:

1. Trabajar sobre la versión correspondiente de `ravanno-dnd5e-es` y conservar
   una copia o commit del diccionario original.
2. Sustituir los valores de las 38 rutas indicadas dentro de `lang/es.json`;
   las rutas completas corresponden al árbol JSON, no a nuevas claves duplicadas.
3. Comprobar la sintaxis y repetir la prueba de etiquetas adaptando su
   comparación de «antes» a la copia original. El diagnóstico incluido exige
   deliberadamente los textos defectuosos originales antes de probar el parche.
4. Activar la traducción del sistema y verificar la tarjeta de una poción tras
   recargar. La integración persistente y esta última revisión visual quedan
   pendientes; aquí se validó el generador real con sustitución temporal.

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

El diagnóstico queda cerrado para esta instalación. La corrección persistente
pertenece a la dependencia de idioma; no requiere alterar las reglas o los
compendios de la traducción de DM.
