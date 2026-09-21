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
      } else if (field === "items") {
        if (value.name) equal(target.name, value.name, `${field}.${id}.name`);
        if (value.description) equal(target.system.description.value, value.description, `${field}.${id}.description`);
      } else subset(target, value, `${field}.${id}`);
    }
  }
}
async function json(path) {
  const response = await fetch(`${ROOT}/${path}`, {cache: "no-store"});
  if (!response.ok) throw new Error(`Cannot read ${path}: ${response.status}`);
  return response.json();
}
export async function validatePilot({importDocuments = true} = {}) {
  if (!game.user.isGM || !game.modules.get(MODULE)?.active) throw new Error("Activate the translation and run as GM.");
  const report = {date: new Date().toISOString(), foundry: game.version, system: game.system.version,
    language: game.settings.get("core", "language"), checks: [], imported: []};
  const ready = [];
  for (const name of PACKS) {
    const collection = `dnd-dungeon-masters-guide.${name}`;
    const translation = await json(`compendium/${collection}.json`);
    const pack = game.packs.get(collection);
    const index = await pack.getIndex();
    for (const [id, entry] of Object.entries(translation.entries)) {
      equal(index.get(id)?.name, entry.name, `${collection}: index`);
      const document = await pack.getDocument(id);
      checkTranslation(document.toObject(), entry, translation.mapping);
      const links = [...JSON.stringify(entry).matchAll(/@(UUID|Embed)\[([^\] ]+)/g)];
      for (const [, , uuid] of links) if (!await fromUuid(uuid.split("#")[0])) throw new Error(`Broken UUID: ${uuid}`);
      report.checks.push({collection, id, name: document.name, index: true, fields: true, links: links.length});
      ready.push({pack, id, entry, mapping: translation.mapping});
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
    new File([JSON.stringify(report, null, 2) + "\n"], "dmg-pilot-validation.json", {type: "application/json"}), {}, {notify: false});
  if (!result?.path) throw new Error("Failed to save validation report");
  ui.notifications.info(`DMG: ${report.checks.length} documentos comprobados; ${report.imported.length} importaciones verificadas.`);
  return report;
}
