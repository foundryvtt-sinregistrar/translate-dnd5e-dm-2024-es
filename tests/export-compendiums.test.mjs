import assert from "node:assert/strict";
import {test} from "node:test";
import {assertOriginal, summarizeDocuments} from "../dev-tools/export/export-compendiums.mjs";

test("rejects Babele markers on nested actor items", () => {
  assert.throws(() => assertOriginal({_id: "actor", items: [{flags: {babele: {originalName: "Sword"}}}]}), /Babele/);
  assert.doesNotThrow(() => assertOriginal({_id: "actor", name: "Dragon", flags: {dnd5e: {}}}));
});

test("effect references inside activities are not embedded ActiveEffects", () => {
  assert.equal(summarizeDocuments([{system: {activities: {a: {effects: [{_id: "effect"}]}}}, effects: [{_id: "effect"}]}]).effects, 1);
});

test("counts nested documents without relying on translated names", () => {
  assert.deepEqual(summarizeDocuments([{items: [{system: {activities: {a: {}, b: {}}, advancement: [{_id: "x"}]}, effects: [{}]}], pages: [{}], results: [{}, {}]}]),
    {documents: 1, items: 1, pages: 1, activities: 2, advancement: 1, effects: 1, results: 2});
});
