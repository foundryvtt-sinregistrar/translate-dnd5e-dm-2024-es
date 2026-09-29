// Explicit QA in Testing. Account creation and player interactions use the UI.
const MODULE = 'translate-dnd5e-dm-2024-es';
const USER = 'QA - DM jugador temporal';
const MARKER = 'player-session-2026-09-29';
const assert = (ok, message) => { if (!ok) throw new Error(message); };
function guard() {
  assert(game.world.id === 'testing' && game.user.isGM, 'Use Testing as GM');
  assert(game.version === '14.368' && game.system.version === '6.0.3', 'Unsupported QA version');
}
async function save(name, report) {
  const result = await foundry.applications.apps.FilePicker.upload('data', `modules/${MODULE}/tmp`,
    new File([JSON.stringify(report, null, 2) + '\n'], name, {type:'application/json'}), {}, {notify:false});
  assert(result?.path, 'Evidence was not saved');
}
export async function prepare() {
  guard();
  assert(game.i18n.lang === 'es' && game.modules.get(MODULE)?.active, 'Activate Spanish and DM translation');
  const players = game.users.filter(u => u.name === USER);
  assert(players.length === 1 && players[0].role === 1, 'Create exactly one QA player using User Management');
  const player = players[0];
  const existing = [...game.items, ...game.journal, ...game.tables].filter(d => d.flags[MODULE]?.playerSessionQa === MARKER);
  assert(existing.every(d=>d.name.startsWith('QA - DM jugador - ')), 'Unexpected renamed QA sample');
  const report = {date:new Date().toISOString(),foundry:game.version,system:game.system.version,
    world:game.world.id,player:{id:player.id,name:player.name,role:player.role},
    before:{time:game.time.worldTime,paused:game.paused,scene:game.scenes.active?.id ?? null},samples:[]};
  // Save the initial state before creating anything so partial setup is recoverable.
  await save('player-session-preparation.json', report);
  for (const [pack,id,name,level,collection] of [
    ['equipment','dmgBootsOfSpeed0','QA - DM jugador - Botas propias',3,game.items],
    ['equipment','dmgPotionOfHeali','QA - DM jugador - Poción observador',2,game.items],
    ['equipment','dmgRingOfProtect','QA - DM jugador - Anillo privado',0,game.items],
    ['content','dmgBringItToAnEn','QA - DM jugador - Diario compartido',2,game.journal],
    ['tables','dmgAdventureClim','QA - DM jugador - Tabla compartida',2,game.tables]
  ]) {
    const source = game.packs.get(`dnd-dungeon-masters-guide.${pack}`);
    const document = existing.find(d=>d.name === name) ?? await collection.importFromCompendium(source,id,{
      name,folder:null,ownership:{default:0,[player.id]:level},
      flags:{[MODULE]:{playerSessionQa:MARKER}}
    },{keepId:false,renderSheet:false});
    assert(document.id !== id, 'Sample must have a new ID');
    report.samples.push({uuid:document.uuid,source:source.collection + '.' + id,name,level});
    await save('player-session-preparation.json', report);
    // Foundry resets ownership during import; apply the test permissions afterwards.
    await document.update({ownership:{default:0,[player.id]:level}},{diff:false,recursive:false});
    assert(document.testUserPermission(player,'OWNER') === (level === 3), 'Unexpected sample ownership');
  }
  ui.notifications.info('QA jugador: cinco muestras preparadas');
  return report;
}
export async function inspect() {
  guard();
  const player = game.users.find(u => u.name === USER);
  assert(player && player.role === 1 && player.active, 'A real Player session must be connected');
  const docs = [...game.items, ...game.journal, ...game.tables].filter(d => d.flags[MODULE]?.playerSessionQa === MARKER);
  const report = {date:new Date().toISOString(),player:{id:player.id,role:player.role,active:player.active,isGM:player.isGM},
    samples:docs.map(d => ({uuid:d.uuid,name:d.name,ownership:d.ownership})),
    messages:game.messages.filter(m => m.author?.id === player.id).map(m => ({id:m.id,type:m.type,rolls:m.rolls.map(r=>({formula:r.formula,total:r.total}))}))};
  await save('player-session-observation.json', report);
  ui.notifications.info('QA jugador: sesión real observada');
  return report;
}
export async function removeSamples() {
  guard();
  const response = await fetch(`/modules/${MODULE}/tmp/player-session-preparation.json`,{cache:'no-store'});
  assert(response.ok, 'Missing preparation record');
  const report = await response.json();
  assert(report.world === game.world.id && report.player.name === USER, 'Unexpected preparation record');
  const player = game.users.get(report.player.id);
  assert(player && player.name === USER && !player.active, 'Sign out the temporary player first');
  const removed = [];
  for (const sample of report.samples) {
    const doc = await fromUuid(sample.uuid);
    assert(doc?.flags[MODULE]?.playerSessionQa === MARKER, 'Refusing to remove an unmarked sample');
    await doc.delete(); removed.push(sample.uuid);
  }
  // This account was created solely for this QA. Only its own test messages are removed.
  const messages = game.messages.filter(m=>m.author?.id === player.id);
  await ChatMessage.deleteDocuments(messages.map(m=>m.id));
  const result = {date:new Date().toISOString(),removed,messages:messages.map(m=>m.id),
    stateUnchanged:game.time.worldTime === report.before.time && game.paused === report.before.paused &&
      (game.scenes.active?.id ?? null) === report.before.scene};
  await save('player-session-cleanup.json', result);
  assert(result.stateUnchanged, 'World state changed during the test');
  ui.notifications.info('QA jugador: muestras retiradas; elimina la cuenta temporal en gestión de usuarios');
  return result;
}
