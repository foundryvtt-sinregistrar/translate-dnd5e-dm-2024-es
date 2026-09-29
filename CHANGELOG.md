# Changelog

Las nuevas entradas se redactan en español, bajo `[Unreleased]` y las categorías `Added`, `Changed` y `Fixed`. El historial anterior conserva su contenido e idioma.

## [Unreleased]

### Added

- Diagnóstico del icono de veneno persistente: reproducido con cero módulos activos en combatientes sin ficha; dos casos comparativos verifican el refresco automático al asociar una ficha. Documentada la mitigación, sin parche de ejecución en DM.

- Validación desde el botón «Turno siguiente»: tres transiciones correctas con cuatro efectos QA, avance real de seis segundos y restauración del reloj. El icono persistente observado se analiza en el diagnóstico del panel de combate.

- Cuatro casos de veneno entre actores distintos: aplicación y reaplicación reales, conservación del efecto y expiración según el combatiente cuyo turno estaba en curso al aplicarlo. Documentada la consecuencia para el GM, común al original y la traducción.

- Validación de duración y expiración del veneno: 16 casos sobre condición y recubrimiento, en original y traducción, con el gestor real de Foundry y eventos de combate controlados. Se conserva el reloj mundial y se documentan los límites de la prueba.

- Integración de salvaciones y controles del chat: cuatro casos de éxito/fallo en original y traducción, con fichas QA, cálculo de daño según la salvación y aplicación explícita de efectos. Documentados requisitos y límites de la automatización de dnd5e 6.0.3.

- Ampliación funcional en Foundry: 14 casos correctos sobre niveles y cargas de la varita, encantamiento y veneno de la daga, recuperación al amanecer y restauración de actores QA. Macro independiente y evidencia documentada; las muestras reponen objetos consumidos para poder repetir las pruebas.

- Ajuste local de concordancia para `ravanno-dnd5e-es` con dnd5e 6.0.3: frases completas de objetivos y numeral singular, verificado con 46 casos y la tarjeta de poción. Se conservan fuente, validador e instrucciones de reversión en desarrollo; no se incluye ni se activa desde el módulo DM.

- Diagnóstico reproducible de la etiqueta `Undefined criaturas`: incompatibilidad de parámetros en el diccionario instalado de `ravanno-dnd5e-es` 6.0.3. Mapa de 38 sustituciones para esa dependencia, aplicado a la copia local con respaldo; 45 casos correctos y tarjeta de poción verificada tras recargar. La corrección local no se distribuye dentro del módulo DM.

- Pruebas funcionales reproducibles en Foundry: diarios importados, enlaces, imágenes, rangos y tiradas de tablas, y seis objetos comparados con sus originales. Informe en `dev-tools/translation/VALIDACION-FUNCIONAL.md` y macro auxiliar `validate-functional.mjs`.

### Changed

- Documentado en ambos README el requisito de importar el capítulo 3 del DMG para resolver el enlace de Sortilegio del santuario. Comprobada la importación normal y la apertura del destino en Foundry; se conserva la referencia original.
- Documentada la ausencia de resultados 8–12 en la tabla oficial `dmgWildernessCha` de DMG 2.0.0; la traducción conserva las fórmulas y rangos originales.

## [0.1.1] - 2026-09-28

- Comprobados en Foundry 873 documentos, nombres y campos explícitos; importada y revisada una muestra. Evidencia y límites en `dev-tools/homogeneizacion/VALIDACION-FOUNDRY.md`.

- Adoptada la licencia MIT para las aportaciones propias de foundryvtt-sinregistrar, conservando los derechos y condiciones de terceros.

### Changed

- Homogeneizados documentación ES/EN, guía de desarrollo, configuración de edición, exclusiones y proceso de distribución. Constructor desde un único commit, perfil por proyecto, manifiesto externo, SHA-256 y validación compartida en PR y releases. Se conservan las particularidades y los avisos de licencia del proyecto.



## [0.1.0] - 2026-09-22 — Versión preliminar

- Primera publicación instalable, con manifiesto remoto y ZIP de distribución.
- Cobertura completa de siete compendios: 873 documentos y 6021 campos de texto.
- Glosario, 23 rasgos y 35 instalaciones de bastión revisados con fuentes españolas.
- Reutilización de traducciones por coincidencia del texto original y generación
  local del resto como borrador automático, pendiente de revisión lingüística.
- Traducción de textos anidados de actores, leyendas de imágenes, etiquetas de
  escenas, requisitos y chat; conservación de mecánicas y recursos.
- Auditoría de cobertura, números, referencias y validación completa en Foundry:
  873 documentos comprobados sin diferencias de texto; 25 pruebas locales.
- Metodología y limitaciones en `dev-tools/translation/ESTADO-TRADUCCION.md`.
- Exportador de siete compendios con control de originales, inventario y SHA-256.
- Inventario verificado de 873 documentos de DMG 2.0.0.
- Traducción piloto de un documento por compendio, con páginas, actividad,
  objeto de actor y diez resultados de tabla.
- Validación en Foundry 14.368 y dnd5e 6.0.3, incluyendo siete importaciones.
- Pruebas de conservación de referencias y mecánicas; 24 pruebas locales correctas.
- Pendientes la revisión lingüística del borrador y la validación exhaustiva de funciones.

## Preparación inicial - 2026-09-21 (sin publicación)

- Esqueleto para Foundry 14.368 y dnd5e 6.0.3.
- Registro de Babele limitado a español y variantes regionales.
- Siete plantillas de compendio sin entradas de traducción.
- Convertidores por ID para páginas, actividades, efectos, avances,
  objetos de actores y resultados de tablas.
- Documentación y pruebas de registro.

## Version Links

[Unreleased]: https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/releases/tag/v0.1.1
