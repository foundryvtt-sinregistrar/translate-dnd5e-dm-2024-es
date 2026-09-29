# Changelog

Las nuevas entradas se redactan en español, bajo `[Unreleased]` y las categorías `Added`, `Changed` y `Fixed`. El historial anterior conserva su contenido e idioma.

## [Unreleased]

### Added

- Diagnóstico del acceso nulo en `getGroupingKey`: dos combatientes sin ficha
  reproducen el error de dnd5e 6.0.3 sin módulos; sus copias en memoria sin
  iniciativa no fallan. Documentado sin modificar el sistema ni el encuentro.

- Paquete local independiente del ajuste de idioma para ravanno 6.0.3, con diff,
  licencias, hashes y comprobación de aplicación y reversión sobre una copia limpia.
- Ampliación QA: importación de tres escenas y resolución de 32 destinos de región,
  reparación, mantenimiento y fabricación de bastión en original y traducción,
  modelo de permisos de jugador y sincronización entre dos clientes GM.

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

- Segundo lote de diarios: 533 campos registrados y 19 diarios completos;
  corregidos 173 campos de 15 documentos sobre campañas, ilustraciones,
  historial oficial y progreso de personajes. Foundry verifica 873 documentos
  y 3468 referencias sin errores. Quedan 416 campos de diarios por cotejar.

- Primer lote amplio de diarios: 262 campos cotejados, con seis documentos
  completos (glosario, ejemplos de aventuras, recompensas, ilustraciones de los
  apéndices, mapas y bastiones). Corregidos 157 campos, conservando las cifras,
  referencias y estructura HTML. Registradas discrepancias entre fuentes;
  continúan pendientes otros 687 campos y la concordancia final.

- Completado el cotejo del equipo: 2449 campos en 548 objetos, incluidas 539
  descripciones. El último lote corrige 261 campos y concordancias de enlaces,
  conserva cifras y referencias y distingue enredadera afilada de enredadera
  feroz. Se revisan requisitos, negaciones, estados, instrucciones de actividades
  y los nombres Oleaje y Rotundo. La revisión extensa de diarios sigue pendiente.

- Cuarto lote de equipo: 151 correcciones en 107 objetos y tres concordancias
  en actores, tablas y diarios. Registrados 1914 campos revisados, con 377
  descripciones completas. Documentada la discrepancia 23/25 de Fuerza en la
  poción de gigante de fuego del original; se conserva su efecto de Fuerza 25.

- Tercer lote de equipo: 182 correcciones en 96 objetos y concordancia de cinco
  etiquetas de tablas/diarios. El registro alcanza 1561 campos revisados, con
  257 descripciones completas. Corregidos tipos de daño, figurillas, explosivos,
  lanzamiento de conjuros y notas de uso; la revisión restante sigue abierta.

- Segundo lote de equipo: 183 correcciones en 80 objetos y concordancia de
  dos etiquetas en tablas/diarios. El registro alcanza 1171 campos revisados,
  incluidas 159 descripciones completas. Se corrigen cartas, invocaciones,
  maldiciones y condiciones de activación; la revisión restante sigue abierta.

- Ampliada la revisión de equipo a 835 campos registrados, incluidas 79
  descripciones completas: 179 correcciones en 96 objetos. Corregidos también
  acentos dañados en tres campos de tablas y uno de bastiones. La revisión del
  resto de equipo y de diarios continúa abierta.

- Revisados los 1738 campos de las 125 tablas: 803 correcciones en tablas y
  29 campos de equipo y diarios para concordar nombres y enlaces. Documentado
  el enlace erróneo del cuerno de bronce en la fuente oficial; se conserva su UUID.
- Revisados los 606 campos de actores y los 142 de escenas. Segundo lote:
  253 correcciones en 58 actores y nueve notas de escenas; conservados HTML,
  cifras, fórmulas y referencias. Decisiones reproducibles por huellas del original.
- Revisadas 424 etiquetas: 395 campos en 207 objetos y 29 en 8 escenas. Corregidos
  errores de significado en actividades, efectos, tipos de criatura y navegación,
  conservando las mecánicas, cifras y referencias. La revisión de párrafos continúa pendiente.
- Revisadas seis descripciones representativas con la referencia española;
  corregidas las dimensiones de la bolsa y la terminología. Adoptado el nombre
  oficial Daga de la ponzoña y actualizadas sus cuatro etiquetas de enlaces.

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
