# Guía del Dungeon Master 2024 — Español (Babele)

Módulo `translate-dnd5e-dm-2024-es`, versión `0.1.0`, en desarrollo.
Incluye los siete compendios completos: 873 documentos y 6021 campos de texto
cubiertos. Los rasgos y bastiones se han revisado con las referencias españolas.
El resto combina traducciones reutilizadas y borradores automáticos locales:
**la revisión lingüística completa está pendiente; no es una versión final**.
Véase el [estado y metodología](dev-tools/translation/ESTADO-TRADUCCION.md).

## Entorno objetivo

- Foundry VTT 14.368.
- Sistema dnd5e 6.0.3.
- Babele 2.9.1 o posterior y sus dependencias.
- Módulo oficial `dnd-dungeon-masters-guide` 2.0.0 o posterior, instalado y activado.

El módulo oficial local 2.0.0 declara Foundry 13 como versión verificada.
La exportación y el piloto se han comprobado en Foundry 14.368 y dnd5e 6.0.3:
índices, campos traducidos, destinos UUID e importaciones al mundo.

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
| `content.json` | JournalEntry | 46 documentos, 473 páginas; borrador |
| `equipment.json` | Item | 548 objetos; borrador |
| `features.json` | Item | 23 rasgos revisados |
| `bastions.json` | Item (facility) | 35 instalaciones revisadas |
| `tables.json` | RollTable | 125 tablas, 1599 resultados; borrador |
| `actors.json` | Actor | 72 actores y objetos anidados; borrador |
| `scenes.json` | Scene | 24 escenas y etiquetas; borrador |

No se duplican los packs oficiales: Babele aplica los JSON sobre los compendios
originales. Los mapeos se han contrastado con las exportaciones y se ha
comprobado la aplicación de los textos de los 873 documentos en Foundry.
Los resultados de tablas usan `description` de Foundry 14; los bastiones conservan
las claves mecánicas del sistema y traducen `system.description.value`.

## Desarrollo

Consultar [ROADMAP.md](dev-tools/ROADMAP.md) para el plan de traducción,
[INVENTARIO.md](dev-tools/translation/INVENTARIO.md) para los recuentos y
[PILOTO.md](dev-tools/translation/PILOTO.md) para reproducir la validación. Véase
[DEVELOPER.md](DEVELOPER.md) para la estructura técnica. Para ejecutar las pruebas:

```sh
node --test tests/*.test.mjs
```

Repositorio: [translate-dnd5e-dm-2024-es](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es).
El manifiesto de instalación remoto y la URL de descarga se añadirán cuando
exista una publicación real.

Traducción no oficial, sin afiliación con Wizards of the Coast ni Foundry VTT.
El contenido del libro y sus ilustraciones pertenecen a sus respectivos titulares.
Las fuentes completas, los PDF y el OCR son locales y están excluidos de Git.
