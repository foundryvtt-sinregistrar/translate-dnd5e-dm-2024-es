# Dungeon Master's Guide (2024) — Spanish Translation

[Español](README.md) | **English**

Translation for Foundry VTT using Babele. Module ID: `translate-dnd5e-dm-2024-es`.

## Status

Version: **0.1.1**. Preliminary version. Includes seven compendiums, 873 documents and 6021 covered text fields according to the project inventory. Features and bastions have been reviewed; complete linguistic review of the remaining content is pending. Project records document a pilot in Foundry 14.368 and dnd5e 6.0.3.

See [CHANGELOG.md](CHANGELOG.md).

Checked on September 28, 2026 with Foundry 14.368, dnd5e 6.0.3 and Babele 2.9.1: loaded 873 documents across 7 compendiums, checked names and explicit text fields, and imported and visually reviewed one sample. This is not an exhaustive linguistic or functional review; some English labels from the original content remain.

Extended functional checks: 3 imported journals (28 pages), 125 audited tables, rolls on 5 tables, and 6 items tested against their originals. All 3468 UUID/Embed references resolved with the linked official products active and chapter 3 imported. [Results, reproduction and limitations (Spanish)](dev-tools/translation/VALIDACION-FUNCIONAL.md).

## Requirements

Versions declared in the manifest; “—” means that the corresponding limit is not declared.

| Dependency | Minimum | Verified |
|---|---|---|
| Foundry VTT | 14.368 | 14.368 |
| dnd5e | 6.0.3 | 6.0.3 |
| babele | 2.9.1 | — |
| dnd-dungeon-masters-guide | 2.0.0 | — |

Install and enable the dependencies, purchasing official products separately when required.

## Installation

In Foundry's Setup screen, open **Add-on Modules → Install Module** and use this manifest:

```text
https://raw.githubusercontent.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/main/module.json
```

For manual installation, download `translate-dnd5e-dm-2024-es.zip` from [releases](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/releases). With Foundry stopped, extract the `translate-dnd5e-dm-2024-es` folder into `Data/modules/`; the manifest must be at `Data/modules/translate-dnd5e-dm-2024-es/module.json`.

## Activation

1. Open a dnd5e world.
2. Enable Babele, its dependencies, the required official products and this translation.
3. Select **Spanish** and reload the world.
4. Open a translated compendium to check the result.

Registration is automatic for `es` and its regional variants. Other languages do not enable the Spanish translation.

### Scene imports

When importing the **Keep** scene (**Torreón** in Spanish), preserve its original
ID (`dmgKeep000000000`): some official teleport destinations depend on it.
Importing with a new ID may leave unresolved region links. Details and
reproduction: [scene validation](dev-tools/translation/VALIDACION-CIERRE.md).

### Sanctuary Charm journal link

**Sanctuary Charm** links to **Supernatural Gifts** in a world journal. To use this link, open the Dungeon Master's Guide content compendium (`dnd-dungeon-masters-guide.content`), open **Chapter 3: DM's Toolbox**, and click **Import** in its header. Then reopen the item sheet. With the Spanish translation enabled, these are **Sortilegio del santuario**, **Regalos sobrenaturales**, and **Capítulo 3: Herramientas de DM**.

Verified with DMG 2.0.0 and Foundry 14.368: this import preserves the chapter ID and resolves the link. Enabling the module or opening the chapter in its compendium is insufficient. If you already have a customized copy, check its ID before importing again to avoid overwriting it. [Details and diagnosis (Spanish)](dev-tools/translation/ENLACE-SANTUARIO.md).

## Updating

Update through Foundry or replace the folder with the published ZIP while Foundry is stopped. Reload the world. Previously imported copies do not synchronize automatically: review differences before replacing documents with your own changes.

## Included content

- `dnd-dungeon-masters-guide.actors.json`.
- `dnd-dungeon-masters-guide.bastions.json`.
- `dnd-dungeon-masters-guide.content.json`.
- `dnd-dungeon-masters-guide.equipment.json`.
- `dnd-dungeon-masters-guide.features.json`.
- `dnd-dungeon-masters-guide.scenes.json`.
- `dnd-dungeon-masters-guide.tables.json`.

## Limitations

In DMG 2.0.0, **Wilderness Chase Complications** (`dmgWildernessCha`) uses `1d12` but only includes results 1–7, in both the original and the Spanish version. Roll manually and consult the official content for this table; the translation does not invent rows or change its rules.

Text coverage and automated tests do not establish that every gameplay automation works. Observe the limitations listed under Status. Imported copies do not update automatically. New release URLs require a publication containing their assets; until available, use a validated ZIP. Private sources, PDFs, OCR and complete official exports are not distributed.

## Support and contributions

Report problems in [issues](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/issues), including versions, affected compendium/document, steps, expected and observed results, and whether it is an imported copy.

## Development

The [development guide](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-dm-2024-es/blob/main/DEVELOPER.md) is available in the repository and excluded from the installable ZIP.

## License and credits

Original contributions by `foundryvtt-sinregistrar` are available under the [MIT license](LICENSE.md), within the scope stated there. The translated source content and other third-party materials retain their rights and terms; MIT grants no additional permissions over them.

Unofficial translation, not affiliated with Wizards of the Coast or Foundry VTT. Official product materials belong to their respective owners. Module author: [foundryvtt-sinregistrar](https://github.com/foundryvtt-sinregistrar).
