// Explicit GM diagnostic for the existing Testing QA samples; no runtime import.
const MODULE='translate-dnd5e-dm-2024-es', FLAG='functionalQa';
const check=(ok,message)=>{if(!ok) throw new Error(message);};
const settle=()=>new Promise(resolve=>setTimeout(resolve,600));

export async function diagnoseTracker() {
  check(game.user.isGM && game.world.id==='testing','Use Testing as GM');
  check(game.version==='14.368' && game.system.version==='6.0.3','Diagnostic targets Foundry 14.368 and dnd5e 6.0.3');
  check(![...game.modules].some(m=>m.active),'Disable all modules for this isolation test');
  // Read persisted QA markers directly: getFlag rejects inactive module scopes.
  const combat=game.combats.find(c=>c.flags[MODULE]?.[FLAG]==='effect-expiry');
  const actor=game.actors.find(a=>a.flags[MODULE]?.[FLAG]==='extended-original');
  const scene=game.scenes.find(s=>s.flags[MODULE]?.[FLAG]==='save-workflow');
  const token=scene?.tokens.find(t=>t.actorId===actor?.id);
  const combatant=combat?.combatants.find(c=>c.actorId===actor?.id);
  const effect=actor?.effects.find(e=>e.flags[MODULE]?.[FLAG]==='qa-cross-expiry');
  check(combat && !combat.active && !combat.started && token && combatant && effect?.disabled,
    'Prepare and restore the previous cross-actor QA samples first');
  check(!game.combats.some(c=>c.active || c.started),'Another encounter is active or started');
  const previousViewed=game.combats.viewed, time=game.time.worldTime;
  const effectData=effect.toObject(), combatantData=combatant.toObject();
  const output={date:new Date().toISOString(),foundry:game.version,system:game.system.version,
    activeModules:[],checks:[],errors:[]};
  const capture=()=>{
    const row=ui.combat.element?.querySelector(`[data-combatant-id="${combatant.id}"]`);
    check(row,'Combatant is absent from rendered tracker');
    return {poisoned:actor.statuses.has('poisoned'),expired:effect.duration.expired,
      active:effect.active,hasToken:!!combatant.token,
      iconCount:[...row.querySelectorAll('img')].filter(img=>img.src.endsWith(effect.img)).length};
  };
  try {
    await combat.update({round:1,turn:combat.turns.findIndex(c=>c.id===combatant.id)},{turnEvents:false});
    ui.combat.viewed=combat;
    for(const linked of [false,true]) {
      await combatant.update({tokenId:linked?token.id:null,sceneId:linked?scene.id:null});
      await effect.update({disabled:false,duration:{...effectData.duration,expired:false},
        start:{...ActiveEffect.implementation.getEffectStart(combat),time:time-60}});
      await ui.combat.render({force:true}); await settle();
      const before=capture();
      check(before.poisoned && before.active && before.iconCount>0,'Initial poison icon was not rendered');
      // This is the persisted update produced by ActiveEffectRegistry, without moving world time.
      await effect.update({'duration.expired':true}); await settle();
      const after=capture();
      check(!after.poisoned && !after.active && after.expired,'Effect did not expire');
      await ui.combat.render({force:true}); await settle();
      const refreshed=capture();
      check(refreshed.iconCount===0,'Explicit tracker refresh did not remove the icon');
      check(linked?after.iconCount===0:after.iconCount>0,'Tracker behavior differs from the investigated source path');
      output.checks.push({case:linked?'linked-token':'actor-only',before,after,refreshed,status:'passed'});
      await effect.update({disabled:true});
    }
  } catch(error) { output.errors.push({error:error.message,stack:error.stack}); }
  finally {
    await effect.update({disabled:true});
    await effect.update({disabled:effectData.disabled,duration:effectData.duration,start:effectData.start});
    await combatant.update({tokenId:combatantData.tokenId,sceneId:combatantData.sceneId});
    await combat.update({round:0,turn:null,active:false},{turnEvents:false});
    ui.combat.viewed=previousViewed ?? null;
    await ui.combat.render({force:true});
  }
  output.finalState={clockUnchanged:game.time.worldTime===time,paused:game.paused,
    effectDisabled:effect.disabled,poisoned:actor.statuses.has('poisoned'),hp:actor.system.attributes.hp.value,
    combatStarted:combat.started,combatActive:combat.active,tokenRestored:combatant.tokenId===combatantData.tokenId};
  output.status=output.errors.length?'failed':output.checks.length===2?'passed':'incomplete';
  await foundry.applications.apps.FilePicker.upload('data',`modules/${MODULE}/tmp`,
    new File([JSON.stringify(output,null,2)+'\n'],'combat-tracker-diagnostic.json',{type:'application/json'}),{},{notify:false});
  ui.notifications.info(`DM QA tracker: ${output.checks.length} cases; ${output.errors.length} errors`);
  return output;
}
