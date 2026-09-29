# Parche independiente para ravanno-dnd5e-es 6.0.3

Corrige 38 parámetros de etiquetas y su concordancia con dnd5e 6.0.3.
Es una distribución local de las correcciones verificadas, no una versión
oficial de ravanno ni una modificación incluida en el ZIP de DM.
Conserva la autoría y licencia de la dependencia; las aportaciones propias
usan MIT, titular foundryvtt-sinregistrar.

## Requisitos

- Copia original de `ravanno-dnd5e-es` 6.0.3 y sistema dnd5e 6.0.3.
- Git instalado para aplicar el diff unificado.
- Babele y libWrapper activos para utilizar el adaptador.
- Foundry detenido durante la aplicación a una instalación y copia de seguridad
  de la carpeta del módulo. Una actualización puede sustituir el parche.

La instalación local usada en las pruebas **ya contiene el parche**. No se debe
aplicar de nuevo. `git apply --check` rechaza una segunda aplicación.

## Aplicar y revertir

Extraer el ZIP fuera de la carpeta del módulo. Desde la raíz de una copia
original de `ravanno-dnd5e-es`, sustituir la ruta del ejemplo por la del diff:

```sh
git -c core.autocrlf=false apply --check /ruta/al/target-labels.patch
git -c core.autocrlf=false apply /ruta/al/target-labels.patch
```

Si falla la comprobación, detenerse y revisar versión, cambios locales y finales
de línea; no forzar el parche. No requiere que el módulo sea un repositorio Git.
Reiniciar Foundry con las dependencias activas y ejecutar las comprobaciones
`validateTargetLabels({patchedInstallation: true})` y `validateTargetGrammar()`
descritas en el diagnóstico del repositorio DM. Históricamente pasaron 45 y
46 casos, respectivamente, además de la tarjeta de poción.

Para revertir, con Foundry detenido y sin cambios posteriores en esas líneas:

```sh
git -c core.autocrlf=false apply --reverse --check /ruta/al/target-labels.patch
git -c core.autocrlf=false apply --reverse /ruta/al/target-labels.patch
```

El ZIP incluye `validation.json` con hashes de los archivos normalizados a LF,
el resultado de aplicar/revertir sobre una copia desechable y `SHA256SUMS.txt`.
No incluye exportaciones de libros, datos de mundos, PDF ni fuentes de Foundry.
No se ha enviado un PR ni una incidencia al mantenedor externo.

## Construcción local

Desde DM, conservando los respaldos de la aplicación original en `tmp/`:

```sh
python -B dev-tools/translation/build_target_patch.py
```

El constructor comprueba los hashes originales, que las únicas diferencias
sean las 38 claves y la importación del adaptador, aplica y revierte el diff
en una carpeta temporal y genera `dist/ravanno-target-labels-6.0.3.zip`.
No modifica la dependencia instalada. El adaptador se desactiva en versiones
del sistema distintas de 6.0.3; hay que revisar la necesidad del parche antes
de migrar a otra versión.
