# Guía del Dungeon Master 2024 — Español (Babele)

Módulo `translate-dnd5e-dm-2024-es`, versión `0.1.0`, en desarrollo.
Incluye una muestra piloto de siete documentos, uno por compendio, sobre
873 originales inventariados. La traducción completa del libro está pendiente.
Las carpetas y los destinos externos a la muestra todavía pueden aparecer en inglés.

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
| `content.json` | JournalEntry | Ponerle fin: dos páginas |
| `equipment.json` | Item | Poción de curación y actividad |
| `features.json` | Item | Aversión al fuego |
| `bastions.json` | Item (facility) | Estudio arcano |
| `tables.json` | RollTable | Clímax para aventuras: diez resultados |
| `actors.json` | Actor | Alfombra voladora: nombre, ficha y objeto anidado |
| `scenes.json` | Scene | Cripta de túmulo: nombre y navegación |

No se duplican los packs oficiales: Babele aplica los JSON sobre los compendios
originales. Los mapeos del piloto se han contrastado con las exportaciones.
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
