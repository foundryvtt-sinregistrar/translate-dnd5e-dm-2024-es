# Guía del Dungeon Master 2024 — Español (Babele)

Esqueleto del módulo `translate-dnd5e-dm-2024-es`, versión `0.1.0`.
Los siete archivos de `compendium/` contienen etiquetas y mapeos iniciales;
sus entradas y carpetas están vacías. Todavía no se incluye la traducción del libro.

## Entorno objetivo

- Foundry VTT 14.368.
- Sistema dnd5e 6.0.3.
- Babele 2.9.1 o posterior y sus dependencias.
- Módulo oficial `dnd-dungeon-masters-guide` 2.0.0 o posterior, instalado y activado.

El módulo oficial local 2.0.0 declara Foundry 13 como versión verificada.
Los valores de compatibilidad de este esqueleto corresponden al entorno objetivo;
falta comprobar la integración dentro de Foundry 14.368.

## Instalación local

1. Mantener esta carpeta en `Data/modules/translate-dnd5e-dm-2024-es`.
2. Reiniciar Foundry si todavía no reconoce el nuevo módulo.
3. Activar Babele, el módulo oficial y esta traducción en un mundo dnd5e.
4. Seleccionar español como idioma y recargar el mundo.

El registro utiliza `babele.init` y espera a `setup` para consultar el idioma
configurado. Solo registra español y sus variantes regionales.

## Compendios preparados

| Archivo (prefijo `dnd-dungeon-masters-guide.`) | Tipo | Estado |
|---|---|---|
| `content.json` | JournalEntry | Pendiente |
| `equipment.json` | Item | Pendiente |
| `features.json` | Item | Pendiente |
| `bastions.json` | Item (facility) | Pendiente |
| `tables.json` | RollTable | Pendiente |
| `actors.json` | Actor | Pendiente |
| `scenes.json` | Scene | Pendiente |

No se duplican los packs oficiales: Babele aplica los JSON sobre los compendios
originales. Los mapeos son una base inicial que habrá que contrastar con los datos
exportados, especialmente los campos específicos de los bastiones.

## Desarrollo

Consultar [ROADMAP.md](ROADMAP.md) para el plan de traducción y
[DEVELOPER.md](DEVELOPER.md) para la estructura técnica. Para comprobar el registro:

```sh
node --test tests/*.test.mjs
```

Repositorio: [translate-dnd5e-dm-2024-es](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es).
El manifiesto de instalación remoto y la URL de descarga se añadirán cuando
exista una publicación real.

Traducción no oficial, sin afiliación con Wizards of the Coast ni Foundry VTT.
El contenido del libro y sus ilustraciones pertenecen a sus respectivos titulares.
Este esqueleto no incluye contenido ni recursos del libro oficial.
