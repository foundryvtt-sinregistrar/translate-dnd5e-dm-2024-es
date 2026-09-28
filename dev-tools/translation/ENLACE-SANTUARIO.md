# Sortilegio del santuario: requisito de importación del diario

Comprobación realizada el **28 de septiembre de 2026**. El enlace funciona al importar el capítulo oficial al mundo; no requiere modificar la traducción ni el UUID de origen.

## Causa

El objeto `dmgSanctuaryChar` del compendio `dnd-dungeon-masters-guide.equipment` contiene esta referencia, también presente en la exportación original de DMG 2.0.0:

```text
JournalEntry.dmgDmsToolbox000.JournalEntryPage.U9qU1oUFTPAK7g50
```

Es un UUID de **mundo**. El destino no existe en un mundo sin ese diario importado, aunque el módulo oficial esté activo. La página sí está disponible en el compendio con este UUID distinto:

```text
Compendium.dnd-dungeon-masters-guide.content.JournalEntry.dmgDmsToolbox000.JournalEntryPage.U9qU1oUFTPAK7g50
```

## Pasos para resolverlo

1. Con el módulo oficial y la traducción activos, abre el compendio de contenido de la Guía del Dungeon Master (`dnd-dungeon-masters-guide.content`).
2. Abre **Capítulo 3: Herramientas de DM** (*Chapter 3: DM's Toolbox*) y pulsa **Importar** en la cabecera del diario. Importa el capítulo completo, no una página suelta.
3. Vuelve a abrir **Sortilegio del santuario** (*Sanctuary Charm*) y pulsa **Regalos sobrenaturales** (*Supernatural Gifts*). Se abre esa página del diario importado.

El botón **Importar** de la ficha conservó tanto el ID `dmgDmsToolbox000` como el ID de página `U9qU1oUFTPAK7g50` en la versión probada. Abrir o consultar el diario dentro del compendio no lo incorpora al mundo.

Si ya existe una copia personalizada, comprueba su UUID antes de reimportar: el nombre del capítulo por sí solo no identifica el destino. Una copia con otro ID no satisface esta referencia. Conserva esa copia y, si necesitas enlazarla, adapta el enlace en tu objeto del mundo a la página correspondiente; no fuerces identificadores ni sobrescribas contenido personalizado para resolverlo.

## Evidencia observada

Entorno: mundo nuevo **Testing** (`testing`), Foundry **14.368**, dnd5e **6.0.3**, DMG **2.0.0**, traducción **0.1.1**, Babele **2.9.1**, idioma `es`.

| Comprobación | Antes de importar | Después de importar |
|---|---|---|
| Diarios en el mundo | Ninguno | `dmgDmsToolbox000` |
| UUID de página del compendio | Resuelto | Resuelto |
| UUID de página del mundo | Sin resolver | Resuelto |
| Enlace en Sortilegio del santuario | Marcado como roto | Abre Regalos sobrenaturales |

La importación se hizo con el botón normal de la interfaz, sin pasar opciones especiales a una macro de creación. El diario importado conserva como origen `Compendium.dnd-dungeon-masters-guide.content.JournalEntry.dmgDmsToolbox000`. Tras pulsar el enlace del objeto, la ficha abierta corresponde a `JournalEntry.dmgDmsToolbox000.JournalEntryPage.U9qU1oUFTPAK7g50`.

El texto visible normalizado y las referencias de la página importada coinciden con los del compendio. El HTML no es idéntico byte a byte; se observó normalización de etiquetas, por ejemplo `<hr />` a `<hr>`.

Se conserva el UUID original para mantener el destino en el diario del mundo y las posibles personalizaciones de ese capítulo. Este cambio solo documenta un requisito verificado. No modifica compendios, reglas, scripts de ejecución, manifiesto ni versión.

## Repetición y alcance

En una macro de script de GM, esta comprobación es de solo lectura:

```js
const page = await fromUuid(
  'JournalEntry.dmgDmsToolbox000.JournalEntryPage.U9qU1oUFTPAK7g50'
);
ui.notifications.info(page
  ? `Enlace resuelto: ${page.name}`
  : 'Falta importar el capítulo Herramientas de DM con su ID original.');
```

Los informes locales `tmp/sanctuary-before.json`, `tmp/sanctuary-after.json` y `tmp/sanctuary-comparison.json` registran los resultados; están excluidos de Git y del ZIP. El mundo de pruebas conserva el capítulo importado y la macro **QA - Enlace santuario DM**. Los cinco módulos activados temporalmente para esta prueba se restauraron a su estado inactivo inicial.

La prueba cubre esta referencia y la importación de su capítulo. No acredita una importación integral del libro ni todas las demás referencias del contenido. Los resultados históricos de la validación general siguen siendo los registrados en su fecha.
