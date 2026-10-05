/** Text-only localization for serialized arrays, keyed objects and contents containers. */
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
export const activityPaths = ["name", "condition", "description.value", "description.chatFlavor", "activation.condition", "range.special", "target.affects.special", "roll.name"];
export const effectPaths = ["name", "description"];
export const tablePaths = ["name", "description", "text"];
export const scenePaths = ["name", "text"];

function applyPaths(target, patch, paths) {
  for (const path of paths) {
    const keys = path.split(".");
    const text = keys.reduce((value, key) => value?.[key], patch);
    if (typeof text !== "string") continue;
    let parent = target;
    for (const key of keys.slice(0, -1)) {
      if (parent[key] == null) parent[key] = {};
      if (!object(parent[key])) { parent = null; break; }
      parent = parent[key];
    }
    if (parent) parent[keys.at(-1)] = text;
  }
}

export function translateById(source, translation, paths, kind) {
  if (!source || typeof source !== "object" || !translation || typeof translation !== "object") return source;
  const clone = globalThis.foundry?.utils?.deepClone ?? structuredClone;
  const out = clone(source);
  const patches = Array.isArray(translation)
    ? Object.fromEntries(translation.filter(row => object(row) && (row._id ?? row.id)).map(row => [row._id ?? row.id, row]))
    : translation;
  const rows = Array.isArray(out) ? out : Array.isArray(out.contents) ? out.contents : out;
  const entries = Array.isArray(rows) ? rows.map(row => [undefined, row]) : Object.entries(rows);
  for (const [key, row] of entries) {
    if (!object(row)) continue;
    const id = row._id ?? row.id ?? key;
    const patch = Object.hasOwn(patches, id) ? patches[id] : undefined;
    if (!object(patch)) continue;
    applyPaths(row, patch, paths);
    if (kind === "advancement") {
      const label = typeof patch.name === "string" ? patch.name : patch.title;
      if (typeof label === "string") row["name" in row ? "name" : "title"] = label;
    }
    if (kind === "activity" && object(patch.profiles) && row.profiles) {
      // Legacy translations identify summon profiles by original name.
      const profiles = Array.isArray(row.profiles) ? row.profiles : Object.values(row.profiles);
      for (const profile of profiles) {
        if (!object(profile)) continue;
        const id = profile._id ?? profile.id;
        const profilePatch = (id && Object.hasOwn(patch.profiles, id))
          ? patch.profiles[id]
          : Object.hasOwn(patch.profiles, profile.name) ? patch.profiles[profile.name] : undefined;
        if (typeof profilePatch?.name === "string") profile.name = profilePatch.name;
      }
    }
  }
  return out;
}
