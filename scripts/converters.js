import {
  dmg2024ActivitiesById,
  dmg2024EffectsById,
  dmg2024AdvancementById,
  dmg2024ActorItemsById,
  dmg2024TableResultsById,
  dmg2024JournalPagesById
} from "./converters/dmg2024-merge-by-id.js";

/** Convertidores estructurados de Babele para los documentos de la Guía del Dungeon Master. */
Hooks.once("babele.init", (babele) => {
  if (!babele?.registerConverters) return;

  // Core settings exist at setup, before Babele loads translations at ready.
  Hooks.once("setup", () => {
    const language = game.settings.get("core", "language");
    if (typeof language !== "string" || language.split("-")[0].toLowerCase() !== "es") return;

    babele.registerConverters({
      dmg2024ActivitiesById,
      dmg2024EffectsById,
      dmg2024AdvancementById,
      dmg2024ActorItemsById,
      dmg2024TableResultsById,
      dmg2024JournalPagesById
    });
  });
});
