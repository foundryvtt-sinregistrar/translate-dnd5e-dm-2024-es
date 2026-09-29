// Explicit development QA. Retains labelled imports; restores mutable test state.
import {validatePilot, checkTranslation} from './validate-pilot.mjs';
const MODULE='translate-dnd5e-dm-2024-es', ROOT=`/modules/${MODULE}`;
const check=(condition,message)=>{if(!condition) throw new Error(message);};
const same=(a,b,message)=>check(JSON.stringify(a)===JSON.stringify(b),message);
const canonical=value=>Array.isArray(value)?value.map(canonical):value && typeof value==='object'?
  Object.fromEntries(Object.keys(value).sort().filter(key=>key!=='_stats').map(key=>[key,canonical(value[key])])):value;
async function json(path) {
  const response=await fetch(`${ROOT}/${path}`,{cache:'no-store'});
  check(response.ok,`Cannot read ${path}`); return response.json();
}

export async function validateCompletion() {
  check(game.user.isGM && game.world.id==='testing','Use Testing as GM');
  check(game.version==='14.368' && game.system.version==='6.0.3','Unsupported QA version');
  for(const id of [MODULE,'babele','dnd-dungeon-masters-guide','dnd-players-handbook','dnd-monster-manual'])
    check(game.modules.get(id)?.active,`Activate ${id}`);
  check(game.i18n.lang==='es','Use Spanish');
  const before={time:game.time.worldTime,scene:game.scenes.active?.id,users:game.users.size,paused:game.paused};
  const output={date:new Date().toISOString(),foundry:game.version,system:game.system.version,
    modules:Object.fromEntries([...game.modules].filter(m=>m.active).map(m=>[m.id,m.version])),checks:[],errors:[]};
  const step=async(name,action)=>{
    try {output.checks.push({name,status:'passed',...await action()});}
    catch(error){output.errors.push({name,error:error.message,stack:error.stack});}
  };
  await step('catalog-after-label-review',async()=>{
    const result=await validatePilot({importDocuments:false,allEntries:true});
    check(!result.errors.length && !result.unresolvedLinks.length,'Catalog has unresolved translations or links');
    return {documents:result.checks.length,links:result.checks.reduce((sum,row)=>sum+row.links,0)};
  });
  const scenePack=game.packs.get('dnd-dungeon-masters-guide.scenes');
  const sceneTranslation=await json('compendium/dnd-dungeon-masters-guide.scenes.json');
  for(const id of ['dmgKeep000000000','dmgRoadsideInn00','dmgSpookyHouse00']) await step(`scene:${id}`,async()=>{
    // Keep has absolute teleport destinations in its source; retain its scene ID.
    const keepId=id==='dmgKeep000000000';
    const source=await scenePack.getDocument(id), marker=`completion-scene-${id}${keepId?'-keep-id':''}`;
    let scene=game.scenes.find(s=>s.flags[MODULE]?.functionalQa===marker);
    if(keepId && !scene) check(!game.scenes.has(id),'Existing scene uses the official ID; do not overwrite it');
    if(!scene) scene=await game.scenes.importFromCompendium(scenePack,id,
      {active:false,navigation:false,flags:{[MODULE]:{functionalQa:marker}}},{keepId,renderSheet:false});
    // Foundry activates the first imported scene when the world has none active.
    if(scene.active && scene.id!==before.scene) {
      await scene.update({active:false});
      if(before.scene) await game.scenes.get(before.scene).activate();
    }
    check(!scene.active,'QA scene remained active');
    const actual=scene.toObject(), expected=source.toObject();
    checkTranslation(actual,sceneTranslation.entries[id],sceneTranslation.mapping);
    for(const key of ['width','height','grid','background','walls','drawings'])
      same(canonical(actual[key]),canonical(expected[key]),`${id}: changed ${key}`);
    let destinations=0;
    for(const region of scene.regions) for(const behavior of region.behaviors) {
      for(const destination of behavior.system.destinations??[]) {
        const target=await fromUuid(destination,{relative:behavior});
        check(target?.documentName==='Region' && target.parent.id===scene.id,'Imported region destination does not resolve locally');
        destinations++;
      }
    }
    // v14 rewrites internal absolute region destinations to relative UUIDs.
    for(const region of [...expected.regions,...actual.regions]) for(const behavior of region.behaviors??[]) {
      if(behavior.system.destinations) behavior.system.destinations=behavior.system.destinations.map(
        destination=>destination.startsWith(`Scene.${id}.Region.`)?`..${destination.split('.').at(-1)}`:destination);
    }
    same(canonical(actual.regions),canonical(expected.regions),`${id}: changed region mechanics`);
    const image=await fetch(scene.background.src,{method:'HEAD'});
    check(image.ok,'Scene background is unavailable');
    return {id,worldId:scene.id,keepId,regions:scene.regions.size,walls:scene.walls.size,destinations,background:image.status};
  });
  const original=(await json('dev-tools/export/data/dnd-dungeon-masters-guide.bastions.en.json')).documents;
  const pack=game.packs.get('dnd-dungeon-masters-guide.bastions');
  const pairs=[];
  for(const variant of ['original','translated']) {
    let facility;
    await step(`facility-setup:${variant}`,async()=>{
      const data=variant==='original'?foundry.utils.deepClone(original.find(d=>d._id==='dmgArcaneStudy00')):
        (await pack.getDocument('dmgArcaneStudy00')).toObject();
      const marker=`completion-facility-${variant}`;
      facility=game.items.find(i=>i.flags[MODULE]?.functionalQa===marker);
      if(!facility) {
        delete data._id;
        data.name=`QA - DM cierre - ${variant}`;
        data.flags??={}; data.flags[MODULE]={functionalQa:marker};
        facility=await Item.create(data,{renderSheet:false});
      }
      check(facility.type==='facility','Wrong facility type');
      return {id:facility.id};
    });
    if(!facility) continue;
    const saved=facility.toObject().system;
    try {
      await step(`facility-repair:${variant}`,async()=>{
        await facility.update({'system.disabled':true});
        const result=await game.dnd5e.bastion.advanceTurn(facility,{duration:7});
        check(result.order==='repair' && !facility.system.disabled,'Repair did not reactivate facility');
        return {order:result.order};
      });
      await step(`facility-maintain:${variant}`,async()=>{
        await facility.update({'system.progress':{value:0,max:null,order:'',paid:false}});
        const result=await game.dnd5e.bastion.advanceTurn(facility,{duration:7});
        check(result.order==='maintain','Idle special facility did not maintain');
        return {order:result.order};
      });
      await step(`facility-craft-cycle:${variant}`,async()=>{
        const uuid='Compendium.dnd-dungeon-masters-guide.equipment.Item.dmgPotionOfHeali';
        await facility.update({'system.craft.item':uuid,
          'system.progress':{value:0,max:14,order:'craft',paid:true}});
        const first=await game.dnd5e.bastion.advanceTurn(facility,{duration:7});
        check(facility.system.progress.value===7 && !first.order,'First turn did not preserve incomplete order');
        const second=await game.dnd5e.bastion.advanceTurn(facility,{duration:7});
        check(second.order==='craft' && second.items?.[0]?.uuid===uuid && second.items[0].quantity===1,
          'Craft completion did not return the selected item');
        check(facility.system.progress.value===0 && !facility.system.progress.max && !facility.system.progress.order,
          'Completed order did not reset progress');
        const cleanUpdate=updates=>Object.fromEntries(Object.entries(updates).filter(([key])=>key!=='_id'));
        pairs.push(canonical({first:cleanUpdate(first.updates),second:cleanUpdate(second.updates),items:second.items}));
        return {days:14,turns:2,produced:second.items};
      });
    } finally {
      await facility.update({'system.disabled':saved.disabled,'system.progress':saved.progress,'system.craft':saved.craft});
    }
  }
  await step('facility-original-translated-parity',async()=>{
    check(pairs.length===2,'Missing a facility result');
    same(pairs[0],pairs[1],`Facility behavior differs: ${JSON.stringify(pairs)}`);return {};
  });
  await step('player-permission-model',async()=>{
    const player=new User.implementation({_id:foundry.utils.randomID(),name:'QA in-memory player',role:1});
    check(!player.isGM,'QA user is not a player');
    const results=[];
    for(const [level,limited,observer,owner] of [[0,false,false,false],[1,true,false,false],[2,true,true,false],[3,true,true,true]]) {
      const actor=new Actor.implementation({name:'QA in-memory permissions',type:'character',ownership:{default:0,[player.id]:level}});
      const permissions=['LIMITED','OBSERVER','OWNER'].map(p=>actor.testUserPermission(player,p));
      same(permissions,[limited,observer,owner],`Permission level ${level} differs`);
      results.push({level,permissions});
    }
    return {cases:results,persistedUsers:0,scope:'permission model; no separate player login'};
  });
  output.finalState={clockUnchanged:game.time.worldTime===before.time,activeSceneUnchanged:game.scenes.active?.id===before.scene,
    usersUnchanged:game.users.size===before.users,pauseUnchanged:game.paused===before.paused};
  if(Object.values(output.finalState).some(value=>!value)) output.errors.push({name:'restoration',error:'Initial world state changed'});
  output.status=output.errors.length?'failed':'passed';
  await foundry.applications.apps.FilePicker.upload('data',`modules/${MODULE}/tmp`,
    new File([JSON.stringify(output,null,2)+'\n'],'functional-completion.json',{type:'application/json'}),{},{notify:false});
  ui.notifications.info(`DM QA cierre: ${output.checks.length} correctos; ${output.errors.length} errores`);
  return output;
}
