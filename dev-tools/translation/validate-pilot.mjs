// Run from a GM script macro after activating this translation and reloading.
const MODULE = "translate-dnd5e-dm-2024-es";
const ROOT = `/modules/${MODULE}`;
const PACKS = ["features", "equipment", "bastions", "tables", "actors", "content", "scenes"];
const get = (value, path) => path.split(".").reduce((v, key) => v?.[key], value);
function equal(actual, expected, label) {
  // Foundry HTML fields trim boundary whitespace while constructing documents.
  if (typeof actual === "string" && typeof expected === "string") {
    actual = actual.trim(); expected = expected.trim();
  }
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label}: unexpected value ${JSON.stringify(actual)?.slice(0, 400)}`);
}
function subset(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === "object") subset(actual?.[key], value, `${label}.${key}`);
    else equal(actual?.[key], value, `${label}.${key}`);
  }
}
export function checkTranslation(doc, entry, mapping) {
  for (const [field, patch] of Object.entries(entry)) {
    const rule = mapping[field] ?? field;
    const actual = get(doc, typeof rule === "string" ? rule : rule.path);
    if (!patch || typeof patch !== "object") { equal(actual, patch, field); continue; }
    for (const [id, value] of Object.entries(patch)) {
      const target = Array.isArray(actual) ? actual.find(row => row._id === id) : actual?.[id];
      if (!target) throw new Error(`${field}.${id}: missing embedded document`);
      if (field === "pages") {
        if (value.name) equal(target.name, value.name, `${field}.${id}.name`);
        if (value.text) equal(target.text.content, value.text, `${field}.${id}.text`);
        if (value.image?.caption) equal(target.image.caption, value.image.caption, `${field}.${id}.image.caption`);
      } else if (field === "items") {
        checkTranslation(target, value, {requirements: "system.requirements", description: "system.description.value", descriptionChat: "system.description.chat",
          unidentifiedDescription: "system.unidentified.description", activities: "system.activities", effects: "effects", advancement: "system.advancement"});
      } else subset(target, value, `${field}.${id}`);
    }
  }
}
async function json(path) {
  const response = await fetch(`${ROOT}/${path}`, {cache: "no-store"});
  if (!response.ok) throw new Error(`Cannot read ${path}: ${response.status}`);
  return response.json();
}
export async function validatePilot({importDocuments = true, allEntries = false} = {}) {
  if (!game.user.isGM || !game.modules.get(MODULE)?.active) throw new Error("Activate the translation and run as GM.");
  const report = {date: new Date().toISOString(), foundry: game.version, system: game.system.version,
    language: game.settings.get("core", "language"), checks: [], imported: [], errors: [], unresolvedLinks: []};
  const pilotIds = new Set(["dmgAversionToFir", "dmgPotionOfHeali", "dmgArcaneStudy00", "dmgAdventureClim", "dmg3x5CarpetofFl", "dmgBringItToAnEn", "dmgBarrowCrypt00"]);
  const resolved = new Map();
  const ready = [];
  for (const name of PACKS) {
    const collection = `dnd-dungeon-masters-guide.${name}`;
    const translation = await json(`compendium/${collection}.json`);
    const pack = game.packs.get(collection);
    const index = await pack.getIndex();
    for (const [id, entry] of Object.entries(translation.entries)) {
      if (!allEntries && !pilotIds.has(id)) continue;
      let document;
      try {
        if (entry.name) equal(index.get(id)?.name, entry.name, `${collection}: index`);
        document = await pack.getDocument(id);
        checkTranslation(document.toObject(), entry, translation.mapping);
      } catch (error) {
        report.errors.push({collection, id, error: error.message});
        continue;
      }
      const texts = [];
      function collect(value, relative) {
        if (typeof value === "string") texts.push({text: value, relative});
        else if (value && typeof value === "object") for (const child of Object.values(value)) collect(child, relative);
      }
      const {pages, items, ...other} = entry;
      collect(other, document);
      for (const [pageId, page] of Object.entries(pages ?? {})) collect(page, document.pages.get(pageId));
      for (const [itemId, item] of Object.entries(items ?? {})) collect(item, document.items.get(itemId));
      const links = texts.flatMap(({text, relative}) => [...text.matchAll(/@(UUID|Embed)\[([^\] ]+)/g)].map(match => ({uuid: match[2], relative})));
      for (const {uuid, relative} of links) {
        const base = uuid.split("#")[0];
        const key = base.startsWith(".") ? `${relative.uuid}:${base}` : base;
        if (!resolved.has(key)) {
          try { resolved.set(key, !!await fromUuid(base, {relative})); } catch { resolved.set(key, false); }
        }
        if (!resolved.get(key)) report.unresolvedLinks.push({collection, id, uuid});
      }
      report.checks.push({collection, id, name: document.name, index: true, fields: true, links: links.length});
      if (pilotIds.has(id)) ready.push({pack, id, entry, mapping: translation.mapping});
    }
  }
  // Keep labelled test imports for visual review; never alter or delete existing world content.
  if (importDocuments) for (const {pack, id, entry, mapping} of ready) {
    const world = game.collections.get(pack.documentName);
    let document = world.find(doc => doc.getFlag(MODULE, "pilotSource") === `${pack.collection}.${id}`);
    if (!document) document = await world.importFromCompendium(pack, id,
      {flags: {[MODULE]: {pilotSource: `${pack.collection}.${id}`}}}, {renderSheet: false});
    checkTranslation(document.toObject(), entry, mapping);
    report.imported.push({type: pack.documentName, id: document.id, name: document.name});
  }
  const result = await foundry.applications.apps.FilePicker.upload("data", `modules/${MODULE}/dev-tools/export/data`,
    new File([JSON.stringify(report, null, 2) + "\n"], allEntries ? "dmg-translation-validation.json" : "dmg-pilot-validation.json", {type: "application/json"}), {}, {notify: false});
  if (!result?.path) throw new Error("Failed to save validation report");
  ui.notifications.info(`DMG: ${report.checks.length} documentos comprobados; ${report.errors.length} errores; ${report.imported.length} importaciones verificadas.`);
  return report;
}
