import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import * as converters from "../scripts/converters/dmg2024-merge-by-id.js";
import {checkTranslation} from "../dev-tools/translation/validate-pilot.mjs";

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const get = (value, path) => path.split(".").reduce((v, key) => v?.[key], value);
const technical = text => [...text.matchAll(/@(?:UUID|Embed)\[[^\]]+\]|\[\[[\s\S]*?\]\]/g)].map(m => m[0]).sort();
function merge(target, patch) {
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value)) merge(target[key] ??= {}, value);
    else target[key] = structuredClone(value);
  }
  return target;
}
globalThis.foundry = {utils: {deepClone: structuredClone, mergeObject: merge}};

test("table descriptions use the v14 field and preserve result mechanics", () => {
  const source = [{_id: "a", description: "English", name: "", range: [1, 3], weight: 3, drawn: false}];
  const result = converters.dmg2024TableResultsById(source, {a: {description: "Español"}, unknown: {description: "Ignored"}});
  assert.deepEqual(result, [{...source[0], description: "Español"}]);
  assert.equal(source[0].description, "English");
});
test("activities stored as a dictionary preserve formulas and activation", () => {
  const source = {heal: {_id: "heal", name: "Consume", healing: {formula: "2d4+2"}, activation: {type: "bonus"}}};
  const result = converters.dmg2024ActivitiesById(source, {heal: {name: "Consumir"}});
  assert.deepEqual(result, {heal: {...source.heal, name: "Consumir"}});
  assert.equal(source.heal.name, "Consume");
});
test("runtime validator tolerates HTML boundary whitespace but rejects untranslated text", () => {
  checkTranslation({system: {description: {value: "<p>Español</p>"}}}, {description: "<p>Español</p>\n"}, {description: "system.description.value"});
  assert.throws(() => checkTranslation({name: "English"}, {name: "Español"}, {}));
});

for (const pack of ["features", "equipment", "bastions", "tables", "actors", "content", "scenes"]) {
  const filename = `dnd-dungeon-masters-guide.${pack}`;
  const sourcePath = new URL(`../dev-tools/export/data/${filename}.en.json`, import.meta.url);
  test(`pilot ${pack}: original IDs, technical references and untouched mechanics`, {skip: !existsSync(sourcePath)}, () => {
    const source = JSON.parse(readFileSync(sourcePath, "utf8"));
    const translation = read(`../compendium/${filename}.json`);
    for (const [id, entry] of Object.entries(translation.entries)) {
      const original = source.documents.find(doc => doc._id === id);
      assert.ok(original, `Unknown source ${id}`);
      const before = structuredClone(original);
      const result = structuredClone(original);
      for (const [key, patch] of Object.entries(entry)) {
        const mapping = translation.mapping[key] ?? key;
        const path = typeof mapping === "string" ? mapping : mapping.path;
        const value = get(original, path);
        if (typeof patch === "string") assert.deepEqual(technical(patch), technical(value ?? ""), `${id}.${key}: technical reference`);
        else for (const [childId, childPatch] of Object.entries(patch)) {
          const child = Array.isArray(value) ? value.find(row => row._id === childId) : value[childId];
          assert.ok(child, `Unknown embedded ID ${childId}`);
          for (const [field, text] of Object.entries(childPatch)) {
            assert.ok(["name", "text", "description"].includes(field), `Non-text patch ${field}`);
            assert.equal(typeof text, "string");
            const sourceText = field === "text" ? child.text.content : field === "description" && key === "items" ? child.system.description.value : child[field];
            assert.deepEqual(technical(text), technical(sourceText ?? ""), `${childId}.${field}: technical reference`);
          }
        }
        const translated = typeof mapping === "string" ? patch : converters[mapping.converter](value, patch);
        const parts = path.split(".");
        const leaf = parts.pop();
        const target = parts.reduce((object, part) => object[part] ??= {}, result);
        target[leaf] = translated;
        // Mechanical sibling fields of translated embedded documents must survive.
        if (patch && typeof patch === "object") {
          for (const child of Array.isArray(value) ? value : Object.values(value)) {
            const translatedChild = Array.isArray(translated) ? translated.find(row => row._id === child._id) : translated[child._id];
            for (const mechanical of ["range", "weight", "changes", "duration", "activation", "healing", "damage", "type", "img", "sort"]) {
              assert.deepEqual(translatedChild[mechanical], child[mechanical], `${child._id}.${mechanical}`);
            }
          }
        }
      }
      checkTranslation(result, entry, translation.mapping);
      assert.deepEqual(original, before, "Source object was mutated");
      // Entire source system (except visible text and activity labels) remains intact.
      if (original.system) {
        const clean = value => { const copy = structuredClone(value); delete copy.description; if (copy.activities) for (const a of Object.values(copy.activities)) delete a.name; return copy; };
        assert.deepEqual(clean(result.system), clean(original.system));
      }
    }
  });
}
