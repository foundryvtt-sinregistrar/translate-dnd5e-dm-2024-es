# Desarrollo

## Estructura

- `module.json`: identidad, dependencias y archivos de entrada.
- `lang/`: mensajes propios y claves de interfaz traducidas del módulo oficial.
- `compendium/`: un JSON de Babele por compendio oficial.
- `scripts/babele-register.js`: registro para español en `setup`.
- `scripts/converters.js`: registro de convertidores con prefijo `dmg2024`.
- `scripts/converters/dmg2024-merge-by-id.js`: combinación de documentos anidados por ID, basada en Tasha.
- `dev-tools/export/data/`: originales ingleses, PDF, OCR e informes de ejecución; excluidos de Git.
- `dev-tools/export/export-compendiums.mjs`: exportador con rechazo de traducciones aplicadas.
- `dev-tools/export/build_inventory.py`: verificación de SHA-256 y generación del inventario.
- `dev-tools/translation/`: inventario, informe del piloto y validador ejecutable en Foundry.
- `tests/`: registro, idiomas, exportador, convertidores e integridad de la muestra.

## Flujo de trabajo

1. Si cambian las fuentes, exportar los siete packs mediante la API de documentos de Foundry sin traducciones aplicadas; consultar `dev-tools/export/README.md`.
2. Guardar la referencia inglesa en `dev-tools/export/data/` y registrar las versiones de origen.
3. Verificar el inventario y comparar cualquier cambio de esquema con los mapeos. El piloto ya cubre el texto principal de bastiones.
4. Incorporar traducciones en `entries`, usando los IDs originales como claves.
5. Añadir valores españoles de carpetas manteniendo sus claves de origen.
6. Verificar macros, referencias, tiradas, reglas y visualización en Foundry.

Los convertidores esperan diccionarios de parches por ID. Para páginas de diario,
`text` es el HTML traducido y se aplica a `text.content`. Para objetos de actores,
`description` se aplica a `system.description.value`. Los parches de actividades,
efectos, resultados de tablas y avances conservan la estructura del documento fuente.
Los resultados de tablas en Foundry 14 usan `description`; el `text` de páginas
de diario es una propiedad de traducción propia de nuestro convertidor.

Ejecutar `node --test tests/*.test.mjs` y la macro descrita en
[PILOTO.md](dev-tools/translation/PILOTO.md). Las pruebas que comparan con las
exportaciones se omiten si estas no están disponibles en el clon local.

No cambiar UUID, IDs, rutas de imágenes, fórmulas ni claves técnicas al traducir.
Sí traducir las etiquetas visibles explícitas de los enlaces. No escribir en los
compendios originales ni publicar exportaciones completas del contenido propietario.

## Publicación

Actualizar versión, URL `download`, CHANGELOG y `dev-tools/RELEASE-NOTES.md`.
Con el árbol limpio y los cambios confirmados, ejecutar:

```sh
python dev-tools/buildScripts/build_release.py
```

El ZIP se construye desde HEAD mediante `git archive`, respetando las exclusiones
de `.gitattributes`. Inspeccionar el paquete antes de subir la etiqueta `vVERSION`.
El workflow de GitHub verifica versión y pruebas portables, construye el ZIP y
publica una versión preliminar con el ZIP y `module.json`. Las pruebas completas
contra originales deben ejecutarse localmente, porque las fuentes no se publican.
El manifiesto estable apunta a `main`; el ZIP utiliza una URL de versión concreta.
