import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import * as converters from "../scripts/converters/dmg2024-merge-by-id.js";
import {checkTranslation} from "../dev-tools/translation/validate-pilot.mjs";

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const get = (value, path) => path.split(".").reduce((v, key) => v?.[key], value);
const flatten = (value, prefix = "") => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === "object" ? flatten(child, path) : [[path, child]];
});
function mechanicalSystem(value) {
  const copy = structuredClone(value);
  delete copy.description;
  delete copy.requirements;
  if (copy.unidentified) delete copy.unidentified.description;
  if (copy.details?.biography) delete copy.details.biography.value;
  if (copy.details?.biography) delete copy.details.biography.public;
  if (copy.details) delete copy.details.alignment;
  if (copy.details?.type) { delete copy.details.type.custom; delete copy.details.type.subtype; }
  if (copy.traits?.languages) delete copy.traits.languages.custom;
  if (copy.attributes?.senses) delete copy.attributes.senses.special;
  for (const activity of Object.values(copy.activities ?? {})) {
    for (const path of ["name", "description.value", "description.chatFlavor", "activation.condition", "range.special", "target.affects.special", "roll.name"]) {
      const parts = path.split("."); const leaf = parts.pop();
      const target = parts.reduce((v, key) => v?.[key], activity);
      if (target && typeof target === "object") delete target[leaf];
    }
  }
  return copy;
}
const technical = text => [...text.matchAll(/@(?:UUID|Embed)\[[^\]]+\]|\[\[[\s\S]*?\]\]|&(?:amp;)?Reference\[[^\]]+\]/g)].map(m => m[0].replace(/\s+#\s+[^\]]+(?=\]\]$)/, "")).sort();
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

test("scene labels preserve geometry and journal captions preserve assets", () => {
  const source = [{_id: "a", text: "Stairs", x: 120, y: 340, rotation: 90, shape: {width: 40, height: 80}}];
  assert.deepEqual(converters.dmg2024SceneTextById(source, {a: {text: "Escaleras"}}), [{...source[0], text: "Escaleras"}]);
  const pages = [{_id: "p", image: {caption: "Map", src: "modules/source/map.webp"}, type: "image"}];
  assert.deepEqual(converters.dmg2024JournalPagesById(pages, {p: {image: {caption: "Mapa"}}}), [{...pages[0], image: {...pages[0].image, caption: "Mapa"}}]);
  assert.equal(source[0].text, "Stairs");
  assert.equal(pages[0].image.caption, "Map");
});

for (const pack of ["features", "equipment", "bastions", "tables", "actors", "content", "scenes"]) {
  const filename = `dnd-dungeon-masters-guide.${pack}`;
  const sourcePath = new URL(`../dev-tools/export/data/${filename}.en.json`, import.meta.url);
  test(`complete pack ${pack}: original IDs, technical references and untouched mechanics`, {skip: !existsSync(sourcePath)}, () => {
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
            if (["activities", "effects", "advancement"].includes(field) && key === "items") continue; // audited recursively by audit_translation.py
            if (text && typeof text === "object") {
              for (const [path, leaf] of flatten({[field]: text})) {
                assert.ok(["activation.condition", "description.chatFlavor", "description.value", "range.special", "target.affects.special", "roll.name", "image.caption"].includes(path), `Non-text patch ${path}`);
                assert.equal(typeof leaf, "string");
                assert.deepEqual(technical(leaf), technical(get(child, path) ?? ""));
              }
              continue;
            }
            assert.ok(["name", "text", "description", "descriptionChat", "unidentifiedDescription", "requirements"].includes(field), `Non-text patch ${field}`);
            assert.equal(typeof text, "string");
            const sourceText = field === "text" && key === "pages" ? child.text.content : field === "description" && key === "items" ? child.system.description.value : field === "descriptionChat" ? child.system.description.chat : field === "unidentifiedDescription" ? child.system.unidentified.description : field === "requirements" ? child.system.requirements : child[field];
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
          for (const [childKey, child] of Array.isArray(value) ? value.map(row => [row._id, row]) : Object.entries(value)) {
            const translatedChild = Array.isArray(translated) ? translated.find(row => row._id === childKey) : translated[childKey];
            for (const mechanical of ["weight", "changes", "duration", "healing", "damage", "type", "img", "sort"]) {
              assert.deepEqual(translatedChild[mechanical], child[mechanical], `${child._id}.${mechanical}`);
            }
            if (child.system) assert.deepEqual(mechanicalSystem(translatedChild.system), mechanicalSystem(child.system));
          }
        }
      }
      checkTranslation(result, entry, translation.mapping);
      assert.deepEqual(original, before, "Source object was mutated");
      // Entire source system (except visible text and activity labels) remains intact.
      if (original.system) {
        assert.deepEqual(mechanicalSystem(result.system), mechanicalSystem(original.system));
      }
    }
  });
}
