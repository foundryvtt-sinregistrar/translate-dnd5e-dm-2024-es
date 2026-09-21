/** Run exportCompendiums() from a Foundry script macro, as GM. */
export const SOURCE = "dnd-dungeon-masters-guide";
export const PACKS = ["content", "equipment", "features", "bastions", "tables", "actors", "scenes"];
export const DESTINATION = "modules/translate-dnd5e-dm-2024-es/dev-tools/export/data";

export function assertOriginal(value, path = "document") {
  if (!value || typeof value !== "object") return;
  if (value.flags?.babele || value.translated || value.hasTranslation || value.originalName) {
    throw new Error(`Babele translation marker at ${path}. Disable Babele and reload before exporting.`);
  }
  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === "object") assertOriginal(child, `${path}.${key}`);
  }
}

export function summarizeDocuments(documents) {
  const counts = {documents: documents.length, pages: 0, activities: 0, effects: 0, advancement: 0, items: 0, results: 0};
  function visit(document) {
    for (const key of ["pages", "effects", "items", "results"]) counts[key] += Object.keys(document[key] ?? {}).length;
    counts.activities += Object.keys(document.system?.activities ?? {}).length;
    counts.advancement += Object.keys(document.system?.advancement ?? {}).length;
    // Count actual embedded documents, not references in activity.effects.
    for (const item of document.items ?? []) visit(item);
  }
  documents.forEach(visit);
  return counts;
}

export async function exportCompendiums() {
  if (!game.user?.isGM) throw new Error("A GM must run the exporter.");
  if (!game.modules.get(SOURCE)?.active) throw new Error("Activate the official Dungeon Master's Guide first.");
  const picker = foundry.applications.apps.FilePicker;
  if (typeof picker.upload !== "function") throw new Error("FilePicker.upload is unavailable.");
  const files = [];
  const inventory = {
    schemaVersion: 2, exportedAt: new Date().toISOString(),
    foundry: game.version, system: {id: game.system.id, version: game.system.version},
    source: {id: SOURCE, version: game.modules.get(SOURCE).version},
    language: game.settings.get("core", "language"), babeleActive: !!game.modules.get("babele")?.active,
    originalCheck: "No Babele markers or translated pack mappings permitted", packs: []
  };
  for (const name of PACKS) {
    const collection = `${SOURCE}.${name}`;
    const pack = game.packs.get(collection);
    if (!pack) throw new Error(`Missing pack: ${collection}`);
    if (game.babele?.mappedCompendiumFor?.(collection)?.translated) throw new Error(`Translated pack: ${collection}. Disable Babele and reload.`);
    const documents = (await pack.getDocuments()).map(doc => doc.toObject());
    const folders = Array.from(pack.folders ?? [], folder => folder.toObject());
    documents.forEach(doc => assertOriginal(doc, `${collection}.${doc._id}`));
    folders.forEach(folder => assertOriginal(folder, `${collection}.folders.${folder._id}`));
    const ids = documents.map(doc => doc._id);
    if (ids.some(id => !id) || new Set(ids).size !== ids.length) throw new Error(`Invalid or duplicate IDs: ${collection}`);
    const payload = {schemaVersion: 1, collection, documentType: pack.documentName, sourceVersion: inventory.source.version, folders, documents};
    const text = JSON.stringify(payload, null, 2) + "\n";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    const sha256 = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    const filename = `${collection}.en.json`;
    files.push({filename, text});
    inventory.packs.push({collection, documentType: pack.documentName, filename, sha256, folders: folders.length, ...summarizeDocuments(documents)});
  }
  // Validate every pack before writing any file. Write the inventory last as completion marker.
  files.push({filename: "dmg-export-inventory.json", text: JSON.stringify(inventory, null, 2) + "\n"});
  for (const {filename, text} of files) {
    const result = await picker.upload("data", DESTINATION, new File([text], filename, {type: "application/json"}), {}, {notify: false});
    if (!result?.path) throw new Error(`Upload failed: ${filename}`);
  }
  ui.notifications.info(`DMG: exported ${inventory.packs.length} original packs to ${DESTINATION}`);
  return inventory;
}
