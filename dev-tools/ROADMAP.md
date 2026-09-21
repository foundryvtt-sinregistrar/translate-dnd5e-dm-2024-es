# Roadmap de traducción — Guía del Dungeon Master 2024

Estado inicial: 2026-09-21. Módulo: `translate-dnd5e-dm-2024-es`.
Entorno objetivo: Foundry VTT 14.368, dnd5e 6.0.3 y Babele 2.9.1.

El esqueleto está creado, los siete compendios tienen mapeos iniciales y las
11 pruebas de registro pasan. Las entradas de traducción están vacías.
Estas pruebas no verifican todavía los documentos ni los convertidores en Foundry.

## 1. Confirmar el entorno y obtener las fuentes

- [ ] Trabajar en una rama dedicada, propuesta: `feature/dmg-es-translation`.
- [ ] Preparar un mundo de pruebas con el sistema, Babele y el módulo oficial activos.
- [ ] Comprobar que el módulo oficial abre correctamente sus siete compendios en Foundry 14.
- [ ] Registrar las versiones exactas y la fecha de extracción.
- [ ] Crear un exportador basado en la API de documentos de Foundry.
- [ ] Exportar contenido, equipo, rasgos, bastiones, tablas, actores y escenas con sus documentos anidados, IDs y carpetas.
- [ ] Obtener la fuente inglesa sin la traducción de este módulo ni de otros proveedores aplicada por Babele.
- [ ] Guardar los originales en `dev-tools/export/data/`, excluidos de Git.
- [ ] Generar un inventario por pack: documentos, páginas, actividades, efectos, avances, objetos de actores y resultados de tablas.

**Salida:** siete exportaciones trazables y un inventario con recuentos reales.
No estimar porcentajes ni plazos antes de conocer ese volumen.

El módulo oficial local inspeccionado era la versión 2.0.0 y declaraba Foundry 13
como versión verificada. Resolver cualquier incompatibilidad antes de tomar sus
datos como referencia para este proyecto.

## 2. Verificar los mapeos con una muestra pequeña

- [ ] Comparar los campos exportados con los mapeos iniciales de `compendium/`.
- [ ] Identificar texto visible aún no cubierto: condiciones, mensajes de chat, etiquetas de actividades, efectos y avances.
- [ ] Examinar especialmente el tipo `facility`: determinar los campos reales de bastiones antes de ampliar el mapeo.
- [ ] Traducir una muestra representativa de cada tipo de documento, incluido un actor con objetos y una tabla con varios resultados.
- [ ] Comprobarla en Foundry: índice, documento abierto, enlaces y documento importado al mundo.
- [ ] Verificar el registro en español y una variante regional, y su ausencia en inglés.
- [ ] Añadir pruebas de los convertidores cuando la muestra revele comportamientos que deban protegerse.

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

Crear el exportador y obtener el inventario de los siete compendios desde el mundo
de pruebas. Con esa referencia se podrá elegir la muestra del piloto y confirmar
si los mapeos y convertidores actuales cubren los bastiones y el resto de documentos.
