# Desarrollo

## Estructura

- `module.json`: identidad, dependencias y archivos de entrada.
- `lang/`: mensajes propios del módulo; no sustituye todavía textos de interfaz del módulo oficial.
- `compendium/`: un JSON de Babele por compendio oficial.
- `scripts/babele-register.js`: registro para español en `setup`.
- `scripts/converters.js`: registro de convertidores con prefijo `dmg2024`.
- `scripts/converters/dmg2024-merge-by-id.js`: combinación de documentos anidados por ID, basada en Tasha.
- `dev-tools/export/data/`: futuras exportaciones fuente.
- `dev-tools/translation/`: futuras herramientas y recursos de traducción.
- `tests/`: comprobaciones de registro y disponibilidad de convertidores.

## Siguiente fase

1. Exportar los siete packs mediante la API de documentos de Foundry en el entorno objetivo.
2. Guardar la referencia inglesa en `dev-tools/export/data/` y registrar las versiones de origen.
3. Comparar los campos exportados con los mapeos iniciales. Añadir campos específicos de bastiones cuando haya datos para verificarlos.
4. Incorporar traducciones en `entries`, usando los IDs originales como claves.
5. Añadir valores españoles de carpetas manteniendo sus claves de origen.
6. Verificar macros, referencias, tiradas, reglas y visualización en Foundry.

Los convertidores esperan diccionarios de parches por ID. Para páginas de diario,
`text` es el HTML traducido y se aplica a `text.content`. Para objetos de actores,
`description` se aplica a `system.description.value`. Los parches de actividades,
efectos, resultados de tablas y avances conservan la estructura del documento fuente.

No cambiar UUID, IDs, rutas de imágenes, fórmulas ni claves técnicas al traducir.
Sí traducir las etiquetas visibles explícitas de los enlaces. No escribir en los
compendios originales ni publicar exportaciones completas del contenido propietario.
