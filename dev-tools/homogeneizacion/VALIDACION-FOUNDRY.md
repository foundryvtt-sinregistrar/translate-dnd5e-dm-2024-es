# Validación en Foundry — 28 de septiembre de 2026

Proyecto: `translate-dnd5e-dm-2024-es`. Versión preparada: **0.1.1**.

Entorno: Foundry **14.368**, dnd5e **6.0.3**, Babele **2.9.1**, idioma `es`, mundo de pruebas `dnd5e-603-testing` en `http://localhost:31490/game`.

Se activaron los siete módulos de traducción y sus productos oficiales. Versiones oficiales observadas: DMG 2.0.0, MM 1.4.0, PHB 2.2.0, Phandelver 3.1.0, Tasha 4.0.0 y Tomb 2.0.0. Estas observaciones no cambian automáticamente los mínimos declarados de compatibilidad.

## Resultado y alcance

- 873 documentos cargados de 7 compendios.
- 873 nombres almacenados contrastados con sus traducciones; se comprobó también el índice.
- 774 campos de texto con mapping explícito contrastados, además de los nombres.
- Cero diferencias pendientes dentro de ese alcance tras distinguir campos almacenados y derivados.
- Una muestra importada y abierta visualmente: **Archivo** (`Compendium.dnd-dungeon-masters-guide.bastions.Item.dmgArchive000000`).
- Nombre, descripción y campos mecánicos seleccionados conservados en la copia importada: tipo, nivel, rareza, peso y daño base cuando existen.

La muestra queda identificada en la carpeta de objetos `QA - Homogeneizacion 2026-09-28`; no se sobrescribieron documentos existentes. No se modificaron compendios oficiales, traducciones fuente ni reglas. La macro de QA y los informes JSON completos son evidencia local, excluida de la distribución.

El validador anidado comprobó 873 documentos sin diferencias de texto. Quedó una referencia sin resolver en `dmgSanctuaryChar`, también presente en la exportación original: `JournalEntry.dmgDmsToolbox000.JournalEntryPage.U9qU1oUFTPAK7g50`. No se alteró esa referencia durante la homogeneización.

**Seguimiento del 28 de septiembre de 2026:** resuelta la causa en el mundo nuevo `testing`. Antes de importar el capítulo 3, el UUID de mundo no existía; después de pulsar **Importar** en el diario oficial **Herramientas de DM**, el mismo UUID se resolvió y el enlace de la ficha abrió **Regalos sobrenaturales**. Se documenta el requisito de importación, sin modificar la referencia original. [Evidencia y reproducción](../translation/ENLACE-SANTUARIO.md).

## Límites

**Ampliación posterior en `testing`:** se probaron diarios, tablas, enlaces y
seis objetos frente a sus originales. Véase
[VALIDACION-FUNCIONAL.md](../translation/VALIDACION-FUNCIONAL.md) para separar
las comprobaciones funcionales nuevas del alcance histórico de esta publicación.
La tabla oficial `dmgWildernessCha` carece de resultados 8–12 en DMG 2.0.0;
no es una alteración introducida por Babele.

Los nombres de objetos no identificados pueden diferir del nombre real almacenado. Se observaron etiquetas inglesas de clase/subclase en algunas fichas, nombres alternativos ingleses y créditos añadidos por el sistema. Se conservan y no se presentan como una traducción íntegra revisada.

La evidencia acredita lectura de compendios e importación y presentación de muestras. No acredita todas las combinaciones de módulos, una campaña completa, combate exhaustivo, importaciones integrales nuevas ni el mecanismo de actualización desde versiones antiguas. La disponibilidad de las URLs públicas y los adjuntos se comprueba después de publicar.
