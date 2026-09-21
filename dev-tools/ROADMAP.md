# Roadmap de traducción — Guía del Dungeon Master 2024

Estado inicial: 2026-09-21. Módulo: `translate-dnd5e-dm-2024-es`.
Entorno objetivo: Foundry VTT 14.368, dnd5e 6.0.3 y Babele 2.9.1.

Actualizado: 2026-09-22. Exportados e inventariados 873 documentos originales.
El piloto contiene una entrada por compendio, comprobada en Foundry y mediante
24 pruebas locales. Alcance y limitaciones: [PILOTO.md](translation/PILOTO.md).

## 1. Confirmar el entorno y obtener las fuentes

- [x] Trabajar en la rama `feature/dmg-es-translation`, creada desde `develop`.
- [x] Preparar un mundo de pruebas con el sistema, Babele y el módulo oficial activos.
- [x] Leer los siete compendios mediante la API de Foundry 14 y comprobar sus índices y documentos piloto.
- [x] Registrar las versiones exactas y la fecha de extracción.
- [x] Crear un exportador basado en la API de documentos de Foundry.
- [x] Exportar contenido, equipo, rasgos, bastiones, tablas, actores y escenas con sus documentos anidados, IDs y carpetas.
- [x] Obtener la fuente inglesa sin la traducción de este módulo ni de otros proveedores aplicada por Babele.
- [x] Guardar los originales en `dev-tools/export/data/`, excluidos de Git.
- [x] Generar un inventario por pack: documentos, páginas, actividades, efectos, avances, objetos de actores y resultados de tablas.

**Salida:** siete exportaciones trazables y un inventario con recuentos reales.
No estimar porcentajes ni plazos antes de conocer ese volumen.

El módulo oficial local inspeccionado era la versión 2.0.0 y declaraba Foundry 13
como versión verificada. Resolver cualquier incompatibilidad antes de tomar sus
datos como referencia para este proyecto.

## 2. Verificar los mapeos con una muestra pequeña

- [x] Comparar los campos exportados con los mapeos iniciales de `compendium/`.
- [x] Identificar campos de texto visible: condiciones, mensajes de chat, etiquetas de actividades, efectos y avances (véase inventario).
- [x] Examinar el tipo `facility`: descripción, campos mecánicos y dependencias `@Embed`.
- [x] Traducir una muestra de cada tipo de documento, incluido un actor con objetos y una tabla con varios resultados.
- [x] Comprobar índices, campos, enlaces e importaciones de las siete entradas; abrir visualmente el bastión y el diario con tabla incrustada.
- [x] Verificar el registro en español y variantes regionales, y su ausencia en inglés mediante pruebas; validación en vivo en `es`.
- [x] Añadir pruebas de convertidores, referencias y conservación de mecánicas del piloto.

**Salida:** recorrido completo de exportación, traducción y carga funcionando.
La traducción masiva empieza después de esta comprobación.

## 3. Fijar terminología y reglas de edición

- [ ] Crear un glosario con término original, traducción elegida, procedencia y observaciones.
- [ ] Contrastar términos con SRD, PHB, MM y Tasha ya traducidos; resolver discrepancias antes de reutilizarlos.
- [ ] Acordar nombres de objetos, rasgos, instalaciones, acciones de bastión, condiciones y títulos de secciones.
- [ ] Fijar criterios de mayúsculas, unidades, abreviaturas, tratamiento al lector y nombres propios.
- [ ] Separar referencias técnicas de texto traducible, incluidas las etiquetas visibles de enlaces UUID.
- [ ] Registrar excepciones justificadas: marcas, nombres propios y pistas que deban coincidir con ilustraciones.

**Salida:** glosario inicial y guía breve de estilo. Las coincidencias de nombre
no bastan para reutilizar reglas: comprobar edición y contexto del texto.

## 4. Traducir por lotes revisables

Prioridad propuesta después del piloto. El inventario puede justificar cambios
en el orden, pero debe mantenerse un registro de los lotes y sus dependencias.

| Orden | Compendio | Alcance principal | Criterio de cierre |
|---|---|---|---|
| 1 | `features` | Nombres, descripciones, actividades, efectos y avances presentes | Texto visible revisado y mecánicas conservadas |
| 2 | `bastions` | Instalaciones y sus campos específicos verificados | Terminología coherente y funcionamiento comprobado |
| 3 | `equipment` | Objetos, descripciones y documentos anidados | Nombres reutilizables en tablas y diario; usos y efectos intactos |
| 4 | `tables` | Nombres, descripciones y resultados | Todos los resultados cubiertos; rangos, pesos y enlaces intactos |
| 5 | `actors` | Nombres, biografía, objetos, actividades y efectos | Ficha e importación correctas; estadísticas sin cambios |
| 6 | `content` | Capítulos, páginas, tablas HTML y etiquetas de enlaces | Revisión por capítulo y referencias coherentes con los packs anteriores |
| 7 | `scenes` | Nombres y navegación; otros campos visibles si los datos lo requieren | Escenas y navegación verificadas sin alterar geometría ni recursos |

Para cada lote:

1. Registrar pack e IDs incluidos; delimitar un conjunto que pueda revisarse completo.
2. Traducir el contenido sin modificar fórmulas, cantidades, reglas, IDs ni destinos de referencias.
3. Revisar significado, terminología, HTML y etiquetas visibles de enlaces.
4. Validar diferencias frente a la fuente y buscar texto inglés residual.
5. Comprobar una muestra funcional en Foundry, cubriendo todos los tipos de cambio del lote.
6. Actualizar el seguimiento y guardar un commit acotado cuando el lote esté revisado.

Estados de seguimiento: **pendiente**, **traducido**, **revisado**, **validado en Foundry**.
La mera presencia de un campo en el JSON no implica que esté traducido.

## 5. Automatizar las comprobaciones y evitar regresiones

- [ ] Validar sintaxis JSON, archivos declarados y nombres de los siete packs.
- [ ] Comparar cobertura por ID con las fuentes: entradas, páginas y documentos anidados ausentes o inesperados.
- [ ] Comprobar que no cambian UUID, macros, tiradas, atributos HTML relevantes ni datos mecánicos.
- [ ] Detectar referencias internas rotas y revisar los destinos externos disponibles en el entorno.
- [ ] Buscar campos y fragmentos ingleses, con revisión humana de candidatos y excepciones.
- [ ] Detectar caracteres dañados y problemas de codificación UTF-8.
- [ ] Si se añaden generadores, separar fuentes inglesas, traducciones revisadas y archivos distribuidos.
- [ ] Probar una regeneración en un directorio temporal y comprobar que conserva todas las correcciones revisadas.
- [ ] Mantener los informes locales en `dev-tools/_informes/`, según `.gitignore`.

**Salida:** auditoría reproducible. Informar por separado de cobertura estructural,
revisión lingüística y validación dentro de Foundry.

## 6. Revisión final y primera publicación de contenido

- [ ] Revisión cruzada de términos entre los siete compendios.
- [ ] Cero pendientes de traducción sin justificar; excepciones documentadas.
- [ ] Abrir documentos y probar importaciones, tiradas de tablas, actividades y funciones de bastiones.
- [ ] Comprobar el comportamiento con los otros módulos de traducción habituales activados.
- [ ] Revisar los textos de interfaz del módulo oficial y traducir las claves necesarias en `lang/es.json`.
- [ ] Actualizar README y CHANGELOG con el alcance real y las versiones comprobadas.
- [ ] Configurar las URLs del repositorio existente, el manifiesto de instalación y la descarga conforme al proceso de publicación elegido.
- [ ] Preparar el ZIP con archivos de ejecución, sin exportaciones fuente, informes ni herramientas de desarrollo.
- [ ] Probar una instalación limpia del paquete antes de publicar la versión.

**Salida:** versión instalable y verificada, con limitaciones conocidas documentadas.

## Próximo paso concreto

Crear el glosario inicial y fijar criterios de estilo con las fuentes OCR y los
otros módulos. Después, traducir los 22 documentos restantes de `features` por
lotes revisables. Mantener las exportaciones originales y repetir la validación
del piloto cuando cambien mapeos o convertidores.
