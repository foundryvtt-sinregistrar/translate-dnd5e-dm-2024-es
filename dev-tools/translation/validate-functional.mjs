// Run explicitly as GM in the Testing world. Creates labelled QA copies only.
import {validatePilot} from './validate-pilot.mjs';
const MODULE = 'translate-dnd5e-dm-2024-es';
const ROOT = `/modules/${MODULE}`;
const FLAG = 'functionalQa';
const LABEL = 'QA - DM funcional 2026-09-28';
const ITEMS = ['dmgPotionOfHeali', 'dmgWandOfMagicMi', 'dmgDaggerOfVenom', 'dmgRingOfProtect', 'dmgBootsOfSpeed0', 'dmgBagOfHolding0'];
const TABLES = ['dmgAdventureClim', 'dmg100GpGemstone', 'dmgArcanaCommon0', 'dmgAstralColorPo', 'dmgEtherCyclone0'];
const JOURNALS = ['dmgBringItToAnEn', 'dmgMagicItemList', 'dmgBMaps00000000'];
function guard() {
  if (!game.user.isGM || game.world.id !== 'testing') throw new Error('Use the Testing world as GM');
  for (const id of [MODULE, 'babele', 'dnd-dungeon-masters-guide', 'dnd-players-handbook', 'dnd-monster-manual']) {
    if (!game.modules.get(id)?.active) throw new Error(`Missing active module: ${id}`);
  }
  if (game.settings.get('core', 'language') !== 'es') throw new Error('Use Spanish');
}
const check = (condition, message) => { if (!condition) throw new Error(message); };
async function json(path) {
  const response = await fetch(`${ROOT}/${path}`, {cache:'no-store'});
  if (!response.ok) throw new Error(`Cannot read ${path}: ${response.status}`);
  return response.json();
}
async function save(name, report) {
  const result = await foundry.applications.apps.FilePicker.upload('data', `modules/${MODULE}/tmp`,
    new File([JSON.stringify(report,null,2)+'\n'], `functional-${name}.json`, {type:'application/json'}), {}, {notify:false});
  if (!result?.path) throw new Error('Could not save evidence; create the ignored tmp directory first');
}
function report() {
  return {date:new Date().toISOString(),world:game.world.id,foundry:game.version,system:game.system.version,
    modules:Object.fromEntries([...game.modules].filter(m=>m.active).map(m=>[m.id,m.version])),checks:[],errors:[],observations:[]};
}
async function step(output, name, action) {
  try { output.checks.push({name,status:'passed',...await action()}); }
  catch (error) { output.errors.push({name,error:error.message}); }
}
async function folder(type) {
  return game.folders.find(f=>f.type===type && f.name===LABEL) ?? await Folder.create({name:LABEL,type});
}
async function importQa(pack, id) {
  const collection=game.collections.get(pack.documentName), key=`${pack.collection}.${id}`;
  let doc=collection.find(d=>d.getFlag(MODULE,FLAG)===key);
  if (!doc) doc=await collection.importFromCompendium(pack,id,
    {folder:(await folder(pack.documentName)).id,flags:{[MODULE]:{[FLAG]:key}}}, {keepId:false,renderSheet:false});
  return doc;
}

export async function catalog() {
  guard();
  const output=report();
  const validation=await validatePilot({importDocuments:false,allEntries:true});
  output.catalog={documents:validation.checks.length,links:validation.checks.reduce((sum,c)=>sum+c.links,0),
    errors:validation.errors,unresolvedLinks:validation.unresolvedLinks};
  const tables=await game.packs.get('dnd-dungeon-masters-guide.tables').getDocuments();
  const originals=(await json('dev-tools/export/data/dnd-dungeon-masters-guide.tables.en.json')).documents;
  for (const table of tables) await step(output,`ranges:${table.id}`,async()=>{
    const match=/^1d(\d+)$/.exec(table.formula);
    check(match,`Unexpected formula: ${table.formula}`);
    const faces=Number(match[1]);
    const missing=[],multiple=[];
    for(let total=1;total<=faces;total++) {
      const results=table.results.filter(r=>r.range[0]<=total && total<=r.range[1]);
      if(!results.length) missing.push(total);
      if(results.length>1) multiple.push(total);
    }
    const original=originals.find(t=>t._id===table.id);
    check(original && original.formula===table.formula,'Formula differs from official source');
    check(JSON.stringify(original.results.map(r=>[r._id,r.range]))===JSON.stringify(table.results.map(r=>[r.id,r.range])), 'Ranges differ from official source');
    if(missing.length) output.observations.push({id:table.id,name:table.name,missing,originalRangesIdentical:true});
    return {id:table.id,formula:table.formula,results:table.results.size,totals:faces,missing,multiple,originalRangesIdentical:true};
  });
  output.status=output.errors.length || validation.errors.length || validation.unresolvedLinks.length ? 'failed':output.observations.length?'completed-with-observations':'passed';
  await save('catalog',output);
  ui.notifications.info(`DM QA: ${output.catalog.documents} documentos; ${tables.length} tablas; ${output.status}`);
  return output;
}

export async function documents() {
  guard(); const output=report();
  for (const id of JOURNALS) await step(output,`journal:${id}`,async()=>{
    const source=await game.packs.get('dnd-dungeon-masters-guide.content').getDocument(id);
    const imported=await importQa(source.compendium,id);
    let enrichedPages=0,images=0,links=0;
    for(const page of imported.pages) {
      if(page.type==='text') {
        const html=await foundry.applications.ux.TextEditor.implementation.enrichHTML(page.text.content,{relativeTo:page,secrets:true});
        const dom=new DOMParser().parseFromString(html,'text/html');
        const broken=[...dom.querySelectorAll('.content-link.broken')].map(a=>a.dataset.uuid || a.textContent);
        check(!broken.length,`Broken enriched links: ${broken.join(', ')}`);
        links+=dom.querySelectorAll('.content-link').length; enrichedPages++;
        if(id==='dmgBMaps00000000') for(const image of dom.querySelectorAll('img[src]')) {
          const response=await fetch(image.getAttribute('src'),{method:'HEAD'});
          check(response.ok && response.headers.get('content-type')?.startsWith('image/'),'Unavailable embedded map image');
          images++;
        }
      }
      if(page.type==='image' && page.src) {
        const response=await fetch(page.src,{method:'HEAD'});
        check(response.ok && response.headers.get('content-type')?.startsWith('image/'),`Unavailable image: ${page.src}`);
        images++;
      }
    }
    return {source:source.uuid,imported:imported.uuid,pages:imported.pages.size,enrichedPages,images,links};
  });
  for(const id of TABLES) await step(output,`draw:${id}`,async()=>{
    const source=await game.packs.get('dnd-dungeon-masters-guide.tables').getDocument(id);
    const imported=await importQa(source.compendium,id);
    const totals=new Set(imported.results.contents.flatMap(r=>r.range));
    for(const total of totals) {
      const roll=await new Roll(String(total)).evaluate();
      const drawn=await imported.roll({roll,recursive:false});
      const expected=imported.results.filter(r=>r.range[0]<=total && total<=r.range[1]);
      check(JSON.stringify(drawn.results.map(r=>r.id).sort())===JSON.stringify(expected.map(r=>r.id).sort()),`Wrong result at ${total}`);
    }
    const drawn=await imported.draw({displayChat:false,recursive:false});
    check(drawn.results.length>0,'Random draw returned no result');
    return {source:source.uuid,imported:imported.uuid,boundaries:totals.size,randomTotal:drawn.roll.total,
      resultId:drawn.results[0].id,description:drawn.results[0].description};
  });
  await step(output,'recursive:dmgEtherCyclone0',async()=>{
    const table=await game.packs.get('dnd-dungeon-masters-guide.tables').getDocument('dmgEtherCyclone0');
    const drawn=await table.roll({roll:await new Roll('13').evaluate(),recursive:true});
    check(drawn.results.length===2,'Expected cyclone text and a result from its nested table');
    check(drawn.results.some(r=>r.parent.id!==table.id),'Nested table was not rolled');
    return {source:table.uuid,total:drawn.roll.total,results:drawn.results.map(r=>({id:r.id,table:r.parent.id}))};
  });
  output.status=output.errors.length?'failed':'passed'; await save('documents',output);
  ui.notifications.info(`DM QA diarios y tiradas: ${output.status}`); return output;
}

async function actorFor(mode) {
  let actor=game.actors.find(a=>a.getFlag(MODULE,FLAG)===mode);
  if (actor) return actor;
  const originals=mode==='original' ? await json('dev-tools/export/data/dnd-dungeon-masters-guide.equipment.en.json') : null;
  const items=[];
  for(const id of ITEMS) {
    const data=originals ? structuredClone(originals.documents.find(d=>d._id===id))
      : (await game.packs.get('dnd-dungeon-masters-guide.equipment').getDocument(id)).toObject();
    check(data,`Missing sample ${id}`);
    data.folder=null; data.system.quantity=id==='dmgPotionOfHeali'?2:1;
    if ('equipped' in data.system) data.system.equipped=false;
    if ('attuned' in data.system) data.system.attuned=false;
    data.flags ??={}; data.flags[MODULE]={[FLAG]:id};
    items.push(data);
  }
  actor=await Actor.create({name:`${LABEL} - ${mode}`,type:'npc',folder:(await folder('Actor')).id,
    flags:{[MODULE]:{[FLAG]:mode}},system:{abilities:{str:{value:14},dex:{value:14},con:{value:14}},
      attributes:{hp:{value:20,max:60},ac:{flat:12,calc:'natural'},movement:{walk:30,units:'ft'}},details:{cr:1}},items});
  return actor;
}

export async function items() {
  guard(); const output=report();
  for(const mode of ['original','translated']) {
    const actor=await actorFor(mode);
    const item=id=>actor.items.find(i=>i.getFlag(MODULE,FLAG)===id);
    await step(output,`${mode}:healing`,async()=>{
      const potion=item('dmgPotionOfHeali');
      await potion.update({'system.quantity':2,'system.uses.spent':0});
      await actor.update({'system.attributes.hp.value':20});
      const activity=potion.system.activities.find(a=>a.type==='heal');
      const used=await activity.use({subsequentActions:false},{configure:false},{create:false});
      check(used,'Potion activation failed');
      const rolls=await activity.rollDamage({},{configure:false},{create:false});
      check(rolls?.length===1,'No healing roll');
      const roll=rolls[0]; check(roll.total>=4 && roll.total<=10,'Healing outside 2d4+2 range');
      await actor.applyDamage([{value:roll.total,type:'healing'}]);
      check(actor.system.attributes.hp.value===20+roll.total,'Healing not applied to QA actor');
      check(potion.system.quantity===1,'Potion quantity did not decrease');
      return {actor:actor.uuid,item:potion.name,formula:roll.formula,total:roll.total,hp:actor.system.attributes.hp.value,quantity:potion.system.quantity};
    });
    await step(output,`${mode}:charges`,async()=>{
      const wand=item('dmgWandOfMagicMi'); await wand.update({'system.uses.spent':0});
      const activity=wand.system.activities.find(a=>a.type==='cast');
      check(await fromUuid(activity.spell.uuid),'Linked spell unavailable');
      const used=await activity.use({subsequentActions:false},{configure:false},{create:false});
      check(used && wand.system.uses.spent===1,'Wand did not consume one charge');
      return {actor:actor.uuid,item:wand.name,remaining:wand.system.uses.value,spell:activity.spell.uuid,cachedSpell:activity.cachedSpell?.uuid};
    });
    await step(output,`${mode}:attack`,async()=>{
      const weapon=item('dmgDaggerOfVenom'); await weapon.update({'system.equipped':true});
      const activity=weapon.system.activities.find(a=>a.type==='attack');
      const attack=await activity.rollAttack({},{configure:false},{create:false});
      const damage=await activity.rollDamage({},{configure:false},{create:false});
      check(attack?.length && damage?.length,'Missing attack or damage roll');
      return {actor:actor.uuid,item:weapon.name,attack:attack.map(r=>({formula:r.formula,total:r.total})),damage:damage.map(r=>({formula:r.formula,total:r.total}))};
    });
    await step(output,`${mode}:protection`,async()=>{
      const ring=item('dmgRingOfProtect');
      await ring.update({'system.equipped':false,'system.attuned':false});
      const before={ac:actor.system.attributes.ac.value,save:actor.system.abilities.dex.save.value};
      await ring.update({'system.equipped':true,'system.attuned':true});
      const after={ac:actor.system.attributes.ac.value,save:actor.system.abilities.dex.save.value};
      check(after.ac===before.ac+1 && after.save===before.save+1,'Protection bonus did not apply');
      await ring.update({'system.equipped':false,'system.attuned':false});
      check(actor.system.attributes.ac.value===before.ac,'Protection bonus did not revert');
      return {actor:actor.uuid,item:ring.name,before,after,reverted:true};
    });
    await step(output,`${mode}:speed`,async()=>{
      const boots=item('dmgBootsOfSpeed0');
      await boots.update({'system.equipped':true,'system.attuned':true});
      const profile=boots.effects.contents[0];
      let applied=actor.effects.find(e=>e.getFlag(MODULE,FLAG)==='speed-applied');
      if(applied) await applied.update({disabled:true});
      const before=actor.system.attributes.movement.walk;
      try {
        const activity=boots.system.activities.find(a=>a.type==='utility');
        const used=await activity.use({subsequentActions:false},{configure:false},{create:false});
        check(used,'Boots utility activity failed');
        // Activity effects are profiles, not passive transferred effects. Apply a QA copy
        // through the same change preparation used by the system's chat effect control.
        const data=profile.toObject(); delete data._id;
        data.disabled=false; data.transfer=false;
        data.origin=activity.uuid; data.flags ??={}; data.flags[MODULE]={[FLAG]:'speed-applied'};
        data.system.changes=await ActiveEffect.implementation.forApplication(data.system.changes,activity,actor);
        if(applied) await applied.update(data);
        else [applied]=await actor.createEmbeddedDocuments('ActiveEffect',[data]);
        const after=actor.system.attributes.movement.walk;
        check(after===2*before,`Utility activated, but boots do not double walking speed: ${before} -> ${after}`);
        return {actor:actor.uuid,item:boots.name,before,after,effect:applied.uuid,consumptionTargets:activity.consumption.targets.length,
          note:'Activity activated, then its effect applied to the QA actor; no resource consumption targets in the official source.'};
      } finally {
        if(applied) await applied.update({disabled:true});
        await boots.update({'system.equipped':false,'system.attuned':false});
        check(actor.system.attributes.movement.walk===before,'Walking speed did not revert');
      }
    });
    await step(output,`${mode}:container`,async()=>{
      const bag=item('dmgBagOfHolding0'), potion=item('dmgPotionOfHeali');
      await potion.update({'system.container':bag.id});
      check(bag.system.contents.some(i=>i.id===potion.id),'Item missing from container');
      check(bag.system.totalWeight===bag.system.weight.value,'Weightless contents increased total weight');
      const result={actor:actor.uuid,item:bag.name,count:bag.system.contentsCount,contentsWeight:bag.system.contentsWeight,totalWeight:bag.system.totalWeight};
      await potion.update({'system.container':null}); return result;
    });
  }
  output.status=output.errors.length?'failed':'passed'; await save('items',output);
  ui.notifications.info(`DM QA objetos: ${output.checks.length} comprobaciones; ${output.errors.length} errores`); return output;
}

export async function openSample(kind,id) {
  guard();
  if(kind==='actor') {
    const actor=await actorFor('translated');
    const potion=actor.items.find(i=>i.getFlag(MODULE,FLAG)==='dmgPotionOfHeali');
    await potion.update({'system.quantity':2,'system.uses.spent':0});
    return actor.sheet.render(true);
  }
  const pack=game.packs.get(`dnd-dungeon-masters-guide.${kind}`);
  const doc=await importQa(pack,id); return doc.sheet.render(true);
}

export async function investigate() {
  guard(); const output=report();
  const table=await game.packs.get('dnd-dungeon-masters-guide.tables').getDocument('dmgWildernessCha');
  const missing=[];
  for(let total=8;total<=12;total++) {
    const result=await table.roll({roll:await new Roll(String(total)).evaluate(),recursive:false});
    missing.push({total,results:result.results.length});
  }
  output.table={uuid:table.uuid,formula:table.formula,missing};
  output.status=missing.every(r=>r.results===0)?'known-source-gap-reproduced':'changed-source-behavior';
  await save('investigation',output); ui.notifications.info('DM QA: diagnóstico de tabla guardado.'); return output;
}
