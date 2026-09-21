import {assertOriginal} from "./export-compendiums.mjs";

// Local bilingual memory for comparing shared source fields before reuse.
// Babele rollback restores its saved original payload; no compendium is modified.
export async function exportReferences() {
  if (!game.user.isGM || !game.babele?.rollbackDocument) throw new Error("GM and Babele rollback API required");
  for (const collection of ["dnd5e.equipment24", "dnd5e.content24", "dnd5e.tables24", "dnd5e.actors24", "dnd-monster-manual.actors"]) {
    const pack = game.packs.get(collection);
    if (!pack) throw new Error(`Missing ${collection}`);
    const documents = [];
    for (const document of await pack.getDocuments()) {
      const translated = document.toObject();
      const restore = (type, value) => {
        const result = game.babele.rollbackDocument(type, value, {pack: collection});
        if (!result) throw new Error(`Cannot restore ${type}`);
        for (const [field, embeddedType] of Object.entries({pages: "JournalEntryPage", items: "Item", effects: "ActiveEffect", results: "TableResult"})) {
          if (Array.isArray(result[field])) result[field] = result[field].map(child => restore(embeddedType, child));
        }
        return result;
      };
      const original = restore(pack.documentName, translated);
      if (!original) throw new Error(`No reliable original for ${collection}.${document.id}`);
      assertOriginal(original, `${collection}.${document.id}`);
      documents.push({original, translated});
    }
    const result = await foundry.applications.apps.FilePicker.upload("data", "modules/translate-dnd5e-dm-2024-es/dev-tools/export/data",
      new File([JSON.stringify({collection, date: new Date().toISOString(), documents}, null, 2)], `${collection}.reference.json`, {type: "application/json"}), {}, {notify: false});
    if (!result?.path) throw new Error(`Failed upload ${collection}`);
    ui.notifications.info(`Memoria local: ${collection}, ${documents.length} documentos`);
  }
}
