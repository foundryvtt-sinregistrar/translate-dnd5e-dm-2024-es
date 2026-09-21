/**
 * Babele registration for this translation module.
 * - Registers only for Spanish ("es" and variants such as "es-ES").
 */
Hooks.once("babele.init", (babele) => {
  if (!babele) return;

  // Foundry 14 has not registered core.language during babele.init.
  // setup runs after core settings exist and before Babele loads its session
  // in ready. Converters are also registered during setup.
  Hooks.once("setup", () => registerSpanishCompendiums(babele));
});

function registerSpanishCompendiums(babele) {
  // Match the language Babele uses for its translation session.
  const current = game.settings.get("core", "language");
  if (typeof current !== "string") return;

  const base = current.split("-")[0].toLowerCase();
  if (base !== "es") return;

  const langs = Array.from(new Set([current, base]));

  for (const lang of langs) {
    try {
      babele.register({
          module: "translate-dnd5e-dm-2024-es",
          lang,
          dir: "compendium"
      });
        console.log(`[Babele - translate-dnd5e-dm-2024-es] Registered for lang="${lang}" (dir=compendium)`);
    } catch (err) {
        console.error(`[Babele - translate-dnd5e-dm-2024-es] Failed registering for lang="${lang}"`, err);
    }
  }
}
