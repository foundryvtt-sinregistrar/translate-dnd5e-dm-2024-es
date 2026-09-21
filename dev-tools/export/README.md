# Fuentes locales para la traducción

## Compendios de Foundry

Ejecutar como GM mediante una macro de tipo Script:

```js
const {exportCompendiums} = await import("/modules/translate-dnd5e-dm-2024-es/dev-tools/export/export-compendiums.mjs");
await exportCompendiums();
```

Se leen los siete packs con la API de documentos, sin modificar los originales.
Si Babele ha traducido un pack o documento, la exportación se rechaza: desactivar
Babele y recargar antes de repetir. Los JSON completos se escriben en `data/`
mediante FilePicker; el inventario incluye versiones, recuentos y SHA-256.
La ejecución reemplaza las exportaciones del mismo nombre. El inventario se
escribe al final y debe verificarse antes de consumir los datos.

## PDF y OCR

Los PDF originales y su texto OCR se guardan en `data/`, excluido de Git.
Consultar [data/ocr/README.md](data/ocr/README.md) para localizar páginas,
entender las métricas y reutilizar los resultados.

```powershell
python dev-tools/export/cache_pdf_ocr.py
```

El script reconoce los dos archivos `DnD5e-2024-dm-en.pdf` y
`DnD5e-2024-dm-es.pdf`, conserva resultados por página y reutiliza la caché
cuando coinciden la fuente y la configuración. Las bibliotecas y modelos locales
necesarios se detallan en el README de la caché.

El OCR sirve para consultar y contrastar el libro. No sustituye la exportación
de los compendios de Foundry, que debe conservar IDs, UUID y estructura de documentos.
