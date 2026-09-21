export function mergeById(source, translation) {
  if (!source || typeof source !== "object" || !translation || typeof translation !== "object") {
    return source;
  }

  const out = foundry.utils.deepClone(source);
  for (const [id, patch] of Object.entries(translation)) {
    if (!patch || typeof patch !== "object") continue;

    if (Array.isArray(out)) {
      const target = out.find((row) => (row?._id ?? row?.id) === id);
      if (target) foundry.utils.mergeObject(target, patch, { insertKeys: true, overwrite: true, inplace: true });
      continue;
    }

    if (out[id]) {
      foundry.utils.mergeObject(out[id], patch, { insertKeys: true, overwrite: true, inplace: true });
    }
  }
  return out;
}

export const dmg2024ActivitiesById = mergeById;
export const dmg2024EffectsById = mergeById;
export const dmg2024AdvancementById = mergeById;
export const dmg2024TableResultsById = mergeById;

export function dmg2024JournalPagesById(source, translation) {
  if (!source || !translation || typeof translation !== "object") return source;
  const out = foundry.utils.deepClone(source);
  const pages = Array.isArray(out) ? out : Array.from(out?.contents ?? Object.values(out));
  for (const page of pages) {
    const id = page?._id ?? page?.id;
    const patch = id ? translation[id] : null;
    if (!patch || typeof patch !== "object") continue;
    if (typeof patch.name === "string") page.name = patch.name;
    if (typeof patch.text === "string") {
      if (typeof page.text === "string") page.text = patch.text;
      else {
        page.text ??= {};
        page.text.content = patch.text;
        page.text.format ??= 1;
      }
    }
  }
  return out;
}

export function dmg2024ActorItemsById(source, translation) {
  if (!Array.isArray(source) || !translation || typeof translation !== "object") return source;

  const out = foundry.utils.deepClone(source);
  for (const item of out) {
    const id = item?._id ?? item?.id;
    const patch = id ? translation[id] : null;
    if (!patch || typeof patch !== "object") continue;

    if (typeof patch.name === "string") item.name = patch.name;
    if (typeof patch.description === "string") {
      item.system ??= {};
      item.system.description ??= {};
      item.system.description.value = patch.description;
    }
    if (patch.activities) {
      item.system ??= {};
      item.system.activities = mergeById(item.system.activities ?? {}, patch.activities);
    }
    if (patch.effects) item.effects = mergeById(item.effects ?? [], patch.effects);
    if (patch.advancement) {
      item.system ??= {};
      item.system.advancement = mergeById(item.system.advancement ?? [], patch.advancement);
    }
  }
  return out;
}
