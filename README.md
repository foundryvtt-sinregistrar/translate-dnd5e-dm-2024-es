# Guía del Dungeon Master (2024) — Traducción al español

**Español** | [English](README.en.md)

Traducción para Foundry VTT mediante Babele. Identificador: `translate-dnd5e-dm-2024-es`.

## Estado

Versión: **0.1.1**. Versión preliminar. Incluye siete compendios, 873 documentos y 6021 campos de texto cubiertos según el inventario del proyecto. Rasgos y bastiones revisados; la revisión lingüística completa del resto sigue pendiente. El historial acredita un piloto en Foundry 14.368 y dnd5e 6.0.3, no una nueva comprobación funcional durante esta homogeneización.

Consulta [CHANGELOG.md](CHANGELOG.md).

## Requisitos

Versiones declaradas en el manifiesto; «—» indica que no se declara ese límite.

| Dependencia | Mínima | Verificada |
|---|---|---|
| Foundry VTT | 14.368 | 14.368 |
| dnd5e | 6.0.3 | 6.0.3 |
| babele | 2.9.1 | — |
| dnd-dungeon-masters-guide | 2.0.0 | — |

Instala y activa las dependencias, adquiriendo por separado los productos oficiales cuando sean necesarios.

## Instalación

En la configuración de Foundry, abre **Add-on Modules → Install Module** y utiliza este manifiesto:

```text
https://raw.githubusercontent.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/main/module.json
```

Para instalar manualmente, descarga `translate-dnd5e-dm-2024-es.zip` de las [releases](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/releases). Con Foundry detenido, extrae la carpeta `translate-dnd5e-dm-2024-es` en `Data/modules/`; el manifiesto debe quedar en `Data/modules/translate-dnd5e-dm-2024-es/module.json`.

## Activación

1. Abre un mundo dnd5e.
2. Activa Babele, sus dependencias, los productos oficiales requeridos y esta traducción.
3. Selecciona **Español** y recarga el mundo.
4. Abre un compendio traducido para comprobar el resultado.

El registro es automático para `es` y sus variantes regionales. Otros idiomas no activan la traducción española.

## Actualización

Actualiza desde Foundry o sustituye la carpeta con el ZIP publicado y Foundry detenido. Recarga el mundo. Las copias ya importadas no se sincronizan automáticamente: revisa las diferencias antes de sustituir documentos con cambios propios.

## Contenido incluido

- `dnd-dungeon-masters-guide.actors.json`.
- `dnd-dungeon-masters-guide.bastions.json`.
- `dnd-dungeon-masters-guide.content.json`.
- `dnd-dungeon-masters-guide.equipment.json`.
- `dnd-dungeon-masters-guide.features.json`.
- `dnd-dungeon-masters-guide.scenes.json`.
- `dnd-dungeon-masters-guide.tables.json`.

## Limitaciones

La cobertura textual y las pruebas automáticas no acreditan todas las automatizaciones de una partida. Conserva las limitaciones indicadas en Estado. Las copias importadas no se actualizan automáticamente. Las nuevas URLs de release necesitan una publicación con sus adjuntos; mientras no estén disponibles, utiliza un ZIP validado. No se distribuyen fuentes privadas, PDF, OCR ni exportaciones oficiales completas.

## Soporte y contribuciones

Comunica errores en las [incidencias](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/issues), indicando versiones, compendio/documento afectado, pasos, resultado esperado y observado, y si se trata de una copia importada.

## Desarrollo

La [guía de desarrollo](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/blob/main/DEVELOPER.md) está disponible en el repositorio y se excluye del ZIP instalable.

## Licencia y créditos

Las aportaciones propias de `foundryvtt-sinregistrar` se ofrecen bajo la licencia [MIT](LICENSE.md), con el alcance allí indicado. El contenido original traducido y los demás materiales de terceros conservan sus derechos y condiciones; MIT no concede permisos adicionales sobre ellos.

Traducción no oficial, sin afiliación con Wizards of the Coast ni Foundry VTT. Los materiales del producto oficial pertenecen a sus respectivos titulares. Autor del módulo: [foundryvtt-sinregistrar](https://github.com/foundryvtt-sinregistrar).
