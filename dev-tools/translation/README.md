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
- `reviewed-labels.json` y `apply_reviewed_labels.py`: decisiones explícitas por
  etiqueta y compendio; previsualización por defecto y escritura con `--apply`.
  Alcance en [REVISION-LINGUISTICA.md](REVISION-LINGUISTICA.md).
- `reviewed-descriptions.json` y `apply_reviewed_descriptions.py`: seis
  descripciones contrastadas con el OCR y sus originales; comprueba HTML,
  números y referencias antes de aplicar. También conserva las etiquetas
  revisadas de enlaces a objetos renombrados.
- `build_target_patch.py`: empaqueta el parche independiente de idioma, comprobando
  aplicación y reversión; instrucciones en [PARCHE-IDIOMA.md](PARCHE-IDIOMA.md).
- `validate-pilot.mjs`: comprueba los textos aplicados por Babele en Foundry.
- `reviewed-actor-texts.json` y `apply_reviewed_actor_texts.py`: revisión de los
  606 campos de actores, identificada por huellas del original; previsualiza
  por defecto y escribe con `--apply`, validando cifras, referencias y HTML.
- `reviewed-table-texts.json` y `apply_reviewed_table_texts.py`: decisiones para
  los 1738 campos de tablas; misma validación con alcance explícito por documento.
- `reviewed-names.json` y `apply_reviewed_names.py`: nombres revisados y etiquetas
  completas de enlaces al mismo documento; previsualización y opción `--apply`.
- `reviewed-equipment-texts.json` y `apply_reviewed_equipment_texts.py`: cotejo de
  los 2449 campos de equipo, con huellas de fuente y ámbito por documento.
- `reviewed-content-texts.json` y `apply_reviewed_content_texts.py`: cotejo parcial
  de diarios, con las mismas garantías. Solo acredita los campos registrados;
  los títulos compartidos no acreditan la revisión de los párrafos de otro diario.

Las exportaciones, cachés, procedencia por campo y resultados de auditoría se
guardan localmente en `../export/data/`, excluidos de Git. Conservarlos para
reanudar sin volver a exportar, procesar OCR o traducir los mismos segmentos.
