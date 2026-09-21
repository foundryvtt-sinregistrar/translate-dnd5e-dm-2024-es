# Piloto de traducción DMG 2024

Validado el 22 de septiembre de 2026 (hora de Madrid) en la rama
`feature/dmg-es-translation`, creada desde `develop`.

## Alcance de los cuatro pasos

1. Rama de trabajo creada.
2. Exportador ejecutado sobre los siete packs oficiales sin traducciones aplicadas.
3. Originales conservados en `../export/data/`; inventario de 873 documentos y
   siete SHA-256 verificados. Véase [INVENTARIO.md](INVENTARIO.md).
4. Un documento piloto por pack traducido y comprobado en Foundry, incluido un bastión.

| Pack | ID | Texto cubierto |
|---|---|---|
| features | `dmgAversionToFir` | Aversión al fuego: nombre y descripción |
| equipment | `dmgPotionOfHeali` | Poción de curación: nombre, descripción y actividad Consumir |
| bastions | `dmgArcaneStudy00` | Estudio arcano: nombre y descripción completa |
| tables | `dmgAdventureClim` | Clímax para aventuras: nombre y diez resultados |
| actors | `dmg3x5CarpetofFl` | Alfombra voladora: nombre, nombre de ficha y objeto anidado |
| content | `dmgBringItToAnEn` | Ponerle fin: nombre y dos páginas |
| scenes | `dmgBarrowCrypt00` | Cripta de túmulo: nombre y navegación |

El actor conserva una biografía que incrusta otro objeto aún pendiente de traducir.
Siete entradas con texto traducido no equivalen a siete documentos íntegramente
traducidos, ni a un porcentaje de revisión lingüística del libro.

## Fuentes y decisiones

Los JSON ingleses exportados determinan IDs, estructura, mecánicas y referencias.
El OCR español se ha usado como referencia terminológica: páginas PDF 120
(Ponerle fin, Desenlace y Clímax para aventuras), 228 (Alfombra voladora),
305 (Poción de curación), 342 (Estudio arcano) y 369 (Cripta de túmulo).
Se adapta el texto a los documentos de Foundry, conservando sus macros y UUID.

No ha sido necesario cambiar los convertidores de ejecución para este piloto.
Las tablas reciben `description`, no el antiguo `text`. `facility` guarda su
descripción en `system.description.value`; los campos de orden, tamaño, nivel
y subtipo siguen siendo claves y valores mecánicos. El sistema muestra su propia
traducción «Espacioso» para el tamaño; el texto del libro utiliza «amplio».

## Comprobaciones realizadas

- Foundry 14.368, dnd5e 6.0.3, DMG 2.0.0, Babele 2.9.1; idioma `es`.
- Siete índices y documentos con los valores traducidos esperados.
- Cinco destinos UUID/Embed resueltos; se conserva el fragmento `#arcana-tables`.
- Siete importaciones al mundo con los mismos campos traducidos.
- Revisión visual de la ficha de Estudio arcano y sus enlaces renderizados.
- Revisión visual del diario Ponerle fin con la tabla incrustada y sus diez resultados.
- 24 pruebas Node correctas, sin omisiones con las fuentes locales presentes:
  registro, idiomas, exportador, convertidores, IDs, referencias técnicas y mecánicas.

El resultado original de la comprobación está en
`../export/data/dmg-pilot-validation.json` (fuera de Git), fechado
`2026-09-21T22:42:56.542Z`. Se conservan los siete documentos importados en el
mundo de pruebas; llevan la marca `flags.translate-dnd5e-dm-2024-es.pilotSource`.
El validador reutiliza estas importaciones y no borra contenido.

Los idiomas regionales y la exclusión del inglés se comprobaron mediante pruebas
automatizadas de registro; no cambiando el idioma del mundo. No se han probado
todos los efectos, órdenes de bastión, tiradas ni actividades del libro.
La resolución automática de UUID comprueba el documento de destino, no el
desplazamiento visual a cada ancla interna.

## Repetir la validación

Activar el módulo oficial, Babele y `translate-dnd5e-dm-2024-es`; dejar inactiva
la antigua copia `translate-dnd5e-dungeon-masters-guide-es`. Recargar y ejecutar
como GM la macro **DMG - Validar piloto**, o este código:

```js
const {validatePilot} = await import("/modules/translate-dnd5e-dm-2024-es/dev-tools/translation/validate-pilot.mjs");
await validatePilot();
```

La macro importa los documentos que falten y guarda el informe local. Para
comprobar solo los compendios, usar `validatePilot({importDocuments: false})`.
Tras editar traducciones, recargar Foundry para vaciar la caché de Babele.
Las importaciones existentes no se actualizan automáticamente al cambiar el JSON.

```sh
python dev-tools/export/build_inventory.py
node --test tests/*.test.mjs
```

Las siete pruebas basadas en originales se omiten en clones sin exportaciones;
las otras 17 no necesitan contenido del libro. Para volver a exportar originales,
desactivar Babele y recargar: el exportador rechaza documentos ya traducidos.

## Siguiente lote

Fijar el glosario y los criterios de estilo a partir del OCR y los otros módulos.
Después, traducir los 22 documentos restantes de `features`, revisando también
sus actividades, y continuar por `bastions` según el roadmap.
