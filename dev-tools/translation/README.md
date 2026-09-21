# Recursos de traducción

Los JSON que carga Babele están en `../../compendium/`.
Consultar [ESTADO-TRADUCCION.md](ESTADO-TRADUCCION.md) para cobertura,
limitaciones y reproducción; [GLOSARIO.md](GLOSARIO.md) contiene los criterios.

- `reuse_verified.py`: reutiliza campos con el mismo texto inglés original.
- `prepare_local_mt.py`: descarga el modelo oficial y lo prepara para CPU.
- `generate_draft.py`: completa campos ausentes; `--refresh` regenera solo
  borradores cuyo contenido no haya sido editado desde la última generación.
- `reviewed-segments.json`: correcciones terminológicas y de segmentos concretos.
  Su presencia no acredita una revisión completa de los párrafos generados.
- `audit_translation.py`: comprueba cobertura, tipos, referencias y cifras.
- `validate-pilot.mjs`: comprueba los textos aplicados por Babele en Foundry.

Las exportaciones, cachés, procedencia por campo y resultados de auditoría se
guardan localmente en `../export/data/`, excluidos de Git. Conservarlos para
reanudar sin volver a exportar, procesar OCR o traducir los mismos segmentos.
