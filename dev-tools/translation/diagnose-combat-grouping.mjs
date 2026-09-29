const MODULE = "translate-dnd5e-dm-2024-es";

/** Reproduce the system's missing-token grouping error without persisting changes. */
export async function diagnoseGrouping() {
  if (!game.user.isGM || game.world.id !== "testing" || game.version !== "14.368"
      || game.system.version !== "6.0.3" || [...game.modules].some(m => m.active)) {
    throw new Error("Requires Testing GM, Foundry 14.368, dnd5e 6.0.3 and zero active modules.");
  }
  const combat = game.combats.find(c => c.flags[MODULE]?.functionalQa === "effect-expiry");
  if (!combat || combat.started || combat.active) throw new Error("Restore the QA encounter first.");
  const before = JSON.stringify(combat.toObject());
  const report = {date: new Date().toISOString(), foundry: game.version,
    system: game.system.version, cases: [], errors: []};
  for (const combatant of combat.combatants) {
    if (combatant.token || combatant.initiative === null) continue;
    const entry = {id: combatant.id, initiative: combatant.initiative, tokenId: combatant.tokenId};
    try {
      combatant.getGroupingKey();
      report.errors.push(`Expected missing-token error for ${combatant.id}`);
    } catch (error) {
      entry.originalError = error.message;
      if (!error.message.includes("getGroupingKey")) report.errors.push(error.message);
    }
    // A temporary document, not an update of the world encounter.
    const neutral = combatant.clone({initiative: null}, {keepId: true});
    entry.withoutInitiative = neutral.getGroupingKey();
    if (entry.withoutInitiative !== null) report.errors.push(`Unexpected grouping key for ${combatant.id}`);
    report.cases.push(entry);
  }
  if (!report.cases.length) report.errors.push("No actor-only QA combatants with initiative found.");
  report.worldUnchanged = JSON.stringify(combat.toObject()) === before;
  if (!report.worldUnchanged) report.errors.push("World encounter changed unexpectedly.");
  const result = await foundry.applications.apps.FilePicker.upload("data", `modules/${MODULE}/tmp`,
    new File([JSON.stringify(report, null, 2) + "\n"], "combat-grouping-diagnostic.json",
      {type: "application/json"}), {}, {notify: false});
  if (!result?.path) throw new Error("Failed to save grouping diagnosis.");
  ui.notifications.info(`QA agrupación: ${report.cases.length} casos; ${report.errors.length} errores del diagnóstico.`);
  return report;
}
