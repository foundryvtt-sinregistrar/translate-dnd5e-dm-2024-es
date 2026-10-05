import assert from "node:assert/strict";
import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import * as converters from "../scripts/converters/dmg2024-merge-by-id.js";

const shapes = {
  array: row => [row],
  keyed: row => ({ originalKey: row }),
  contents: row => ({ contents: [row] })
};
const first = value => Array.isArray(value) ? value[0] : value.contents ? value.contents[0] : value.originalKey;

test("all shipped nested patches use supported textual paths", () => {
  const allowed = {
    activities: new Set(["name", "condition", "description.value", "description.chatFlavor", "activation.condition", "range.special", "target.affects.special", "roll.name"]),
    effects: new Set(["name", "description"]),
    advancement: new Set(["name", "title", "hint"]),
    results: new Set(["name", "description", "text"])
  };
  function check(patch, kind, path = "") {
    for (const [key, value] of Object.entries(patch)) {
      const full = path ? path + "." + key : key;
      if (kind === "activities" && !path && key === "profiles") {
        for (const profile of Object.values(value)) {
          assert.deepEqual(Object.keys(profile), ["name"]);
          assert.equal(typeof profile.name, "string");
        }
      } else if (value && typeof value === "object") check(value, kind, full);
      else {
        assert.ok(allowed[kind].has(full), kind + "." + full);
        assert.equal(typeof value, "string");
      }
    }
  }
  function walk(value) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (allowed[key]) for (const row of Object.values(child)) check(row, key);
      else walk(child);
    }
  }
  const folder = new URL("../compendium/", import.meta.url);
  for (const file of readdirSync(folder).filter(file => file.endsWith(".json"))) {
    walk(JSON.parse(readFileSync(new URL(file, folder), "utf8")).entries);
  }
});
for (const [shape, wrap] of Object.entries(shapes)) {
  test(`${shape}: text changes preserve all mechanics and source data`, () => {
    const source = wrap({ _id: "one", name: "English", hint: "Original", level: 3,
      configuration: { items: ["uuid"] }, value: { chosen: ["str"] } });
    const before = structuredClone(source);
    const translated = converters.dmg2024AdvancementById(source, {
      one: { title: "Rasgo", hint: "", level: 20, configuration: {}, value: {}, _id: "changed" },
      missing: { title: "Extra" }
    });
    assert.deepEqual(first(translated), { ...first(before), name: "Rasgo", hint: "" });
    assert.deepEqual(source, before);
    assert.equal(converters.dmg2024AdvancementById(source, null), source);
    assert.equal(Array.isArray(translated), Array.isArray(source));

    const effect = wrap({ _id: "one", name: "English", description: "Original",
      changes: [{ key: "system.x", value: "1" }], disabled: false });
    assert.deepEqual(first(converters.dmg2024EffectsById(effect, {
      one: { name: "Efecto", description: "Texto", disabled: true, changes: [] }
    })), { ...first(effect), name: "Efecto", description: "Texto" });
    const table = wrap({ _id: "one", description: "English", range: [1, 4], weight: 4 });
    assert.deepEqual(first(converters.dmg2024TableResultsById(table, {
      one: { description: "Texto", range: [99, 99], weight: 0 }
    })), { ...first(table), description: "Texto" });
  });
}

test("activity text and summon profile labels preserve formulas and profile UUIDs", () => {
  const source = { one: { _id: "one", name: "English", activation: { type: "bonus", value: 1, condition: "Original" },
    range: { value: 30, units: "ft", special: "" }, roll: { formula: "1d6", name: "Roll" },
    profiles: [{ _id: "fish", name: "Fish", uuid: "Compendium.original", count: 1 }] } };
  const before = structuredClone(source);
  const out = converters.dmg2024ActivitiesById(source, { one: {
    name: "Actividad", activation: { type: "action", value: 99, condition: "Condición" },
    range: { value: 999, units: "m", special: "Especial" }, roll: { formula: "99d20", name: "Tirada" },
    profiles: { Fish: { name: "Pez", uuid: "Changed", count: 99 } }
  } });
  const expected = structuredClone(source);
  expected.one.name = "Actividad";
  expected.one.activation.condition = "Condición";
  expected.one.range.special = "Especial";
  expected.one.roll.name = "Tirada";
  expected.one.profiles[0].name = "Pez";
  assert.deepEqual(out, expected);
  assert.deepEqual(source, before);
});
