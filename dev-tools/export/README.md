# Fuentes locales para la traducción

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
