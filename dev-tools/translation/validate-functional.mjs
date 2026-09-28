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
  catch (error) { output.errors.push({name,error:error.message,stack:error.stack}); }
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

async function actorFor(mode,{extended=false}={}) {
  const identity=extended?`extended-${mode}`:mode;
  let actor=game.actors.find(a=>a.getFlag(MODULE,FLAG)===identity);
  const originals=mode==='original' ? await json('dev-tools/export/data/dnd-dungeon-masters-guide.equipment.en.json') : null;
  const items=[];
  for(const id of ITEMS) {
    if(actor?.items.some(i=>i.getFlag(MODULE,FLAG)===id)) continue;
    const data=originals ? structuredClone(originals.documents.find(d=>d._id===id))
      : (await game.packs.get('dnd-dungeon-masters-guide.equipment').getDocument(id)).toObject();
    check(data,`Missing sample ${id}`);
    data.folder=null; data.system.quantity=id==='dmgPotionOfHeali'?2:1;
    if ('equipped' in data.system) data.system.equipped=false;
    if ('attuned' in data.system) data.system.attuned=false;
    data.flags ??={}; data.flags[MODULE]={[FLAG]:id};
    items.push(data);
  }
  if(actor) {
    if(items.length) await actor.createEmbeddedDocuments('Item',items);
    return actor;
  }
  actor=await Actor.create({name:`${LABEL} - ${identity}`,type:'npc',folder:(await folder('Actor')).id,
    flags:{[MODULE]:{[FLAG]:identity}},system:{abilities:{str:{value:14},dex:{value:14},con:{value:14}},
      attributes:{hp:{value:20,max:60},ac:{flat:12,calc:'natural'},movement:{walk:30,units:'ft'}},details:{cr:1}},items});
  return actor;
}

export async function extendedItems() {
  guard(); const output=report();
  for(const mode of ['original','translated']) {
    const actor=await actorFor(mode,{extended:true});
    const wand=actor.items.find(i=>i.getFlag(MODULE,FLAG)==='dmgWandOfMagicMi');
    const dagger=actor.items.find(i=>i.getFlag(MODULE,FLAG)==='dmgDaggerOfVenom');
    const cast=wand.system.activities.find(a=>a.type==='cast');
    for(const level of [1,2,3]) await step(output,`${mode}:wand-level-${level}`,async()=>{
      await wand.update({'system.uses.spent':0});
      let spellActivity;
      const hook=Hooks.on('dnd5e.postUseActivity',activity=>{
        if(activity.actor?.id===actor.id && activity.item.type==='spell') spellActivity=activity;
      });
      try {
        const result=await cast.use({scaling:level-1,spell:{slot:`spell${level}`},subsequentActions:false},
          {configure:false},{create:false});
        check(result && spellActivity,'Linked spell did not activate');
        check(wand.system.uses.spent===level,`Expected ${level} charges, spent ${wand.system.uses.spent}`);
        const damage=await spellActivity.rollDamage({},{configure:false},{create:false});
        check(damage?.length,'Linked spell did not roll damage');
        check(spellActivity.item.scalingIncrease===level-1 && Number(spellActivity.target.affects.count)===level+2,'Spell scaling or missile count differs');
        check(damage.length===1 && damage[0].formula.replaceAll(' ','')==='1d4+1','Wrong damage per missile');
        return {actor:actor.uuid,remaining:wand.system.uses.value,scaling:spellActivity.item.scalingIncrease,
          targets:spellActivity.target.affects.count,damage:damage.map(r=>({formula:r.formula,total:r.total})),spell:cast.spell.uuid};
      } finally { Hooks.off('dnd5e.postUseActivity',hook); }
    });
    await step(output,`${mode}:wand-insufficient-charges`,async()=>{
      await wand.update({'system.uses.spent':6});
      const result=await cast.use({scaling:2,spell:{slot:'spell3'},subsequentActions:false},{configure:false},{create:false});
      check(!result && wand.system.uses.spent===6,'Insufficient charges did not prevent activation');
      return {remaining:wand.system.uses.value,requested:3,blocked:true};
    });
    await step(output,`${mode}:poison`,async()=>{
      await dagger.update({'system.uses.spent':0,'system.equipped':true});
      let enchantment=dagger.effects.find(e=>e.getFlag(MODULE,FLAG)==='qa-poison-enchantment'
        && dagger.system.activities.some(a=>a.dependentOrigin?.id===e.id));
      if(enchantment) await enchantment.update({disabled:true});
      let condition=actor.effects.find(e=>e.getFlag(MODULE,FLAG)==='qa-poison-condition');
      if(condition) await condition.update({disabled:true});
      const originalImage=dagger.img;
      const activity=dagger.system.activities.find(a=>a.type==='enchant');
      try {
        // The system collects rider activities using the originating chat card.
        const activation=await activity.use({subsequentActions:false},{configure:false},
          {create:true,rollMode:'self'});
        check(activation?.message,'Coating activation failed');
        check(JSON.stringify(activation.message._source.whisper)===JSON.stringify([game.user.id]),'QA coating card is not private to its author');
        check(dagger.system.uses.spent===1,'Poison coating did not consume its use');
        if(enchantment && dagger.system.activities.some(a=>a.dependentOrigin?.id===enchantment.id)) {
          await enchantment.update({disabled:false});
        }
        else {
          enchantment=await activity.applyEnchantment(activity.effects[0]._id,dagger,{chatMessage:activation.message});
          check(enchantment,'Could not apply enchantment to QA dagger');
          await enchantment.setFlag(MODULE,FLAG,'qa-poison-enchantment');
        }
        check(dagger.img!==originalImage,'Enchantment did not change dagger image');
        const poison=dagger.system.activities.find(a=>a.type==='save' && a.canUse);
        check(poison && poison.save.dc.value===15 && poison.save.ability.has('con'),
          `Poison save not available with CON DC 15: ${JSON.stringify(dagger.system.activities.filter(a=>a.type==='save').map(a=>({id:a.id,canUse:a.canUse,dc:a.save.dc.value,ability:[...a.save.ability],origin:a.dependentOrigin?.uuid})))}`);
        check(poison.damage.onSave==='none','Successful save must negate poison damage');
        const saveRolls=await actor.rollSavingThrow({ability:'con'},{configure:false},{create:false});
        const damage=await poison.rollDamage({},{configure:false},{create:false});
        check(saveRolls?.length===1 && damage?.length===1,'Missing saving throw or poison damage');
        check(damage[0].formula.replaceAll(' ','')==='2d10' && damage[0].total>=2 && damage[0].total<=20,'Poison damage differs from 2d10');
        await actor.update({'system.attributes.hp.value':60});
        await actor.applyDamage([{value:damage[0].total,type:'poison'}]);
        check(actor.system.attributes.hp.value===60-damage[0].total,'Poison damage not applied');
        const profile=dagger.effects.get(poison.effects[0]._id);
        const data=profile.toObject(); delete data._id;
        data.disabled=false; data.transfer=false; data.origin=poison.uuid;
        data.flags??={}; data.flags[MODULE]={[FLAG]:'qa-poison-condition'};
        data.system.changes=await ActiveEffect.implementation.forApplication(data.system.changes,poison,actor);
        if(condition) await condition.update(data);
        else [condition]=await actor.createEmbeddedDocuments('ActiveEffect',[data]);
        check(actor.statuses.has('poisoned'),'Poisoned condition not active');
        return {actor:actor.uuid,dc:poison.save.dc.value,save:saveRolls[0].total,
          saveSucceeds:saveRolls[0].total>=15,damage:{formula:damage[0].formula,total:damage[0].total},
          hp:actor.system.attributes.hp.value,condition:condition.uuid,enchantment:enchantment.uuid,
          message:activation.message.uuid,privateCard:true,
          note:'Damage and condition applied explicitly as a failed-save scenario; not automatic save branching.'};
      } finally {
        if(condition) await condition.update({disabled:true});
        if(enchantment) await enchantment.update({disabled:true});
        await dagger.update({'system.uses.spent':0,'system.equipped':false});
        await actor.update({'system.attributes.hp.value':20});
        check(!actor.statuses.has('poisoned') && dagger.img===originalImage,'QA poison state did not revert');
      }
    });
    await step(output,`${mode}:dawn-recovery`,async()=>{
      await dagger.update({'system.uses.spent':1});
      await wand.update({'system.uses.spent':7});
      for(const period of ['sr','lr']) for(const item of [dagger,wand]) {
        const recovery=await item.system.recoverUses(new Map([[period,1]]));
        check(foundry.utils.isEmpty(recovery.updates),'Rest unexpectedly recovered a dawn-only item');
      }
      const daggerRecovery=await dagger.system.recoverUses(new Map([['dawn',1]]));
      await dagger.update(daggerRecovery.updates);
      check(dagger.system.uses.value===1,'Dagger did not recover at dawn');
      const wandRecovery=await wand.system.recoverUses(new Map([['dawn',1]]));
      check(wandRecovery.rolls.length===1,'Wand recovery did not roll');
      const roll=wandRecovery.rolls[0];
      await wand.update(wandRecovery.updates);
      check(roll.total>=2 && roll.total<=7 && wand.system.uses.value===roll.total,'Incorrect wand dawn recovery');
      const recovered=wand.system.uses.value;
      await wand.update({'system.uses.spent':1});
      const capped=await wand.system.recoverUses(new Map([['dawn',1]]));
      await wand.update(capped.updates);
      check(wand.system.uses.value===7,'Dawn recovery exceeded the maximum or failed to fill one missing charge');
      return {daggerRemaining:dagger.system.uses.value,wandRecovery:{formula:roll.formula,total:roll.total,recovered},
        wandCappedAt:wand.system.uses.value,shortAndLongRestDoNotRecover:true,worldTimeAdvanced:false};
    });
    await step(output,`${mode}:cleanup`,async()=>{
      check(!actor.statuses.has('poisoned') && actor.system.attributes.hp.value===20,'QA actor did not return to its initial health state');
      check(dagger.effects.filter(e=>e.getFlag(MODULE,FLAG)==='qa-poison-enchantment').every(e=>e.disabled),'QA enchantment remains enabled');
      check(dagger.img===dagger._source.img && !dagger.system.equipped,'QA dagger did not revert');
      return {actor:actor.uuid,hp:actor.system.attributes.hp.value,poisoned:false,enchantmentsDisabled:true,
        daggerRemaining:dagger.system.uses.value,wandRemaining:wand.system.uses.value};
    });
  }
  output.status=output.errors.length?'failed':'passed';
  await save('extended-items',output);
  ui.notifications.info(`DM QA ampliada: ${output.checks.length} casos; ${output.errors.length} errores`);
  return output;
}

// Integration test of the installed chat handlers, with real messages and linked QA tokens.
export async function saveWorkflow() {
  guard(); const output=report();
  const previousScene=canvas.scene;
  let scene=game.scenes.find(s=>s.getFlag(MODULE,FLAG)==='save-workflow');
  if(!scene) scene=await Scene.create({name:`${LABEL} - salvaciones`,active:false,navigation:false,
    width:1000,height:1000,flags:{[MODULE]:{[FLAG]:'save-workflow'}}});
  const fixture=document.createElement('section');
  fixture.dataset.dmQa='save-workflow'; document.body.append(fixture);
  try {
    // Recorded targets resolve to token objects only on the viewed canvas.
    await scene.view();
    for(const mode of ['original','translated']) {
      const actor=await actorFor(mode,{extended:true});
      let token=scene.tokens.find(t=>t.actorId===actor.id);
      if(!token) [token]=await scene.createEmbeddedDocuments('Token',[
        {name:`QA salvacion - ${mode}`,actorId:actor.id,actorLink:true,x:100,y:mode==='original'?100:300}]);
      const dagger=actor.items.find(i=>i.getFlag(MODULE,FLAG)==='dmgDaggerOfVenom');
      const enchantment=dagger.effects.find(e=>e.getFlag(MODULE,FLAG)==='qa-poison-enchantment'
        && dagger.system.activities.some(a=>a.dependentOrigin?.id===e.id));
      check(enchantment,'Run extendedItems() once to prepare the QA enchantment');
      for(const outcome of ['success','failure']) await step(output,`${mode}:save-${outcome}`,async()=>{
        const effectsBefore=new Set(actor.effects.map(e=>e.id));
        try {
          await actor.update({'system.attributes.hp.value':60});
          await enchantment.update({disabled:false});
          const poison=dagger.system.activities.find(a=>a.type==='save' && a.canUse);
          const targets=[{actor:actor.uuid,token:token.uuid}];
          const speaker=ChatMessage.getSpeaker({actor,scene,token});
          const activation=await poison.use({subsequentActions:false},{configure:false},
            {create:true,rollMode:'self',data:{speaker,system:{targets}}});
          const origin=activation.message;
          check(origin,'Missing poison usage card');
          // Deliberate QA-only bonuses ensure both outcomes without replacing the real roll engine.
          const rolls=await actor.rollSavingThrow({ability:'con',target:15,
            rolls:[{parts:[outcome==='success'?'100':'-100']}]},{configure:false},
            {create:true,rollMode:'self',data:{speaker,system:{...poison.messageSources,origin:origin.id}}});
          check(rolls?.length===1,'Missing saving throw');
          check(origin.system.outcomes.get(token.uuid)===outcome,'Saving throw not associated with the target token');
          const damageRolls=await poison.rollDamage({},{configure:false},
            {create:true,rollMode:'self',data:{speaker,system:{origin:origin.id,targets}}});
          const damageMessage=game.messages.filter(m=>m.type==='damage' && m.system.origin?.id===origin.id).at(-1);
          check(damageMessage && damageRolls.length===1,'Missing linked damage card');
          check(actor.system.attributes.hp.value===60 && !actor.statuses.has('poisoned'),
            'Rolling alone unexpectedly applied damage or poison');
          const damageHtml=await damageMessage.renderHTML(); fixture.append(damageHtml);
          const tray=damageHtml.querySelector('damage-application');
          check(tray,'Missing damage application tray');
          tray.open=true; tray.visible=true; tray.targetList.visible=true;
          tray.targetList.targetingMode='targeted'; tray.targetList.buildTargetsList();
          check([...tray.targetList.querySelectorAll('option')].some(o=>o.value===token.uuid),'Target absent from damage tray');
          const multiplier=tray.getMergedOptions(token.uuid).multiplier;
          check(multiplier===(outcome==='success'?0:1),'Incorrect save-based damage multiplier');
          await tray._onApplyDamage(new Event('click',{cancelable:true}));
          const expectedHp=60-(outcome==='success'?0:damageRolls[0].total);
          check(actor.system.attributes.hp.value===expectedHp,'Chat damage handler applied the wrong amount');
          check(!actor.statuses.has('poisoned'),'Damage handler unexpectedly applied the condition');
          if(outcome==='failure') {
            const effectHtml=await origin.renderHTML(); fixture.append(effectHtml);
            const effects=effectHtml.querySelector('effect-application');
            check(effects,'Missing effect application tray');
            effects.effects=await origin.system.getEffects();
            if(!effects.effectsList.children.length) effects.buildEffectsList();
            effects.open=true; effects.visible=true;
            const targetList=effects.targetList ?? effectHtml.querySelector('recorded-targets');
            check(targetList,'Missing effect targets');
            targetList.visible=true; targetList.suspended=false; targetList.targetingMode='targeted';
            targetList.buildTargetsList();
            await effects._onApplyEffects();
            check(actor.statuses.has('poisoned'),'Chat effect handler did not apply poisoned');
          }
          const messages=game.messages.filter(m=>m.id===origin.id || m.system.origin?.id===origin.id);
          check(messages.length>=3 && messages.every(m=>JSON.stringify(m._source.whisper)===JSON.stringify([game.user.id])),
            'Workflow cards are not private');
          return {actor:actor.uuid,token:token.uuid,outcome,save:rolls[0].total,dc:15,
            multiplier,damage:damageRolls[0].total,hp:actor.system.attributes.hp.value,
            poisoned:actor.statuses.has('poisoned'),automaticApplication:false,
            effectAction:outcome==='failure'?'GM handler applied':'GM omitted after success',
            messages:messages.map(m=>m.uuid)};
        } finally {
          for(const effect of actor.effects.filter(e=>!effectsBefore.has(e.id))) {
            await effect.setFlag(MODULE,FLAG,'qa-save-workflow'); await effect.update({disabled:true});
          }
          for(const effect of actor.effects.filter(e=>e.getFlag(MODULE,FLAG)==='qa-save-workflow')) {
            if(!effect.disabled) await effect.update({disabled:true});
          }
          await enchantment.update({disabled:true});
          await actor.update({'system.attributes.hp.value':20});
          fixture.replaceChildren();
          check(!actor.statuses.has('poisoned'),'QA condition did not clear');
        }
      });
    }
  } finally {
    fixture.remove();
    if(previousScene) await previousScene.view();
    else await canvas.draw(null);
  }
  output.scene=scene.uuid;
  output.status=output.errors.length?'failed':'passed';
  await save('save-workflow',output);
  ui.notifications.info(`DM QA salvaciones: ${output.checks.length} casos; ${output.errors.length} errores`);
  return output;
}

// Advance only QA effect start timestamps; the world clock never moves.
export async function effectExpiry() {
  guard(); const output=report();
  check(CONFIG.ActiveEffect.expiryAction==='update','This QA requires non-deleting effect expiry');
  const time=game.time.worldTime, previousViewed=game.combats.viewed;
  const actors=await Promise.all(['original','translated'].map(mode=>actorFor(mode,{extended:true})));
  check(actors.every(a=>!a.statuses.has('poisoned')),'QA actors already have an active poison condition');
  let combat=game.combats.find(c=>c.getFlag(MODULE,FLAG)==='effect-expiry');
  if(!combat) combat=await Combat.create({name:`${LABEL} - caducidad`,active:false,round:0,turn:null,
    flags:{[MODULE]:{[FLAG]:'effect-expiry'}},combatants:actors.map((a,i)=>
      ({actorId:a.id,name:a.name,initiative:20-i,hidden:true}))});
  check(!combat.active && combat.combatants.size===2
    && combat.combatants.every(c=>actors.some(a=>a.id===c.actorId)),'Unexpected QA combat contents');
  try {
    for(const [index,actor] of actors.entries()) {
      const mode=index===0?'original':'translated';
      const owner=combat.turns.findIndex(c=>c.actorId===actor.id), other=owner===0?1:0;
      check(owner>=0,'QA actor absent from combat');
      const dagger=actor.items.find(i=>i.getFlag(MODULE,FLAG)==='dmgDaggerOfVenom');
      const enchantment=dagger.effects.find(e=>e.getFlag(MODULE,FLAG)==='qa-poison-enchantment'
        && dagger.system.activities.some(a=>a.dependentOrigin?.id===e.id));
      check(enchantment?.disabled,'Run extendedItems() first and leave the QA enchantment disabled');
      let condition=actor.effects.find(e=>e.getFlag(MODULE,FLAG)==='qa-expiry-condition');
      if(!condition) {
        const profile=dagger.effects.find(e=>e.statuses.has('poisoned') && e.type==='base');
        check(profile,'Missing official poison profile');
        const data=profile.toObject(); delete data._id;
        data.disabled=true; data.transfer=false; data.origin=dagger.uuid;
        data.flags??={}; data.flags[MODULE]={[FLAG]:'qa-expiry-condition'};
        [condition]=await actor.createEmbeddedDocuments('ActiveEffect',[data]);
      }
      for(const effect of [condition,enchantment]) {
        const kind=effect===condition?'condition':'coating';
        const source=effect.toObject();
        check(source.duration.value===60 && source.duration.units==='seconds'
          && source.duration.expiry==='turnStart','Official duration changed');
        const registry=new ActiveEffect.implementation.registry.constructor();
        try {
          await combat.update({round:1,turn:owner},{turnEvents:false});
          await effect.update({disabled:false,'duration.expired':false,start:{
            ...ActiveEffect.implementation.getEffectStart(combat),time:time-59}});
          registry.add(effect);
          await step(output,`${mode}:${kind}:59s-own-turn`,async()=>{
            check(registry.has(effect),'QA effect is not expiry-trackable');
            await registry.refresh('turnStart',{combat,actors:new Set([actor])});
            check(effect.duration.secondsRemaining===1 && !effect.duration.expired && effect.active,'Expired before 60 seconds');
            return {remaining:effect.duration.secondsRemaining,expired:false,active:effect.active};
          });
          await effect.update({'start.time':time-60});
          await combat.update({turn:other},{turnEvents:false});
          await step(output,`${mode}:${kind}:60s-other-turn`,async()=>{
            await registry.refresh('turnStart',{combat,actors:new Set([actor])});
            check(effect.duration.secondsRemaining===0 && !effect.duration.expired && effect.active,'Expired on another combatant turn');
            return {remaining:0,expired:false,active:effect.active};
          });
          await combat.update({turn:owner},{turnEvents:false});
          await step(output,`${mode}:${kind}:60s-round-start`,async()=>{
            await registry.refresh('roundStart',{combat,actors:new Set([actor])});
            check(!effect.duration.expired && effect.active,'Wrong event expired the effect');
            return {expired:false,active:effect.active};
          });
          await step(output,`${mode}:${kind}:60s-own-turn`,async()=>{
            await registry.refresh('turnStart',{combat,actors:new Set([actor])});
            check(effect.parent.effects.has(effect.id),'Expiry deleted the QA effect');
            check(effect._source.duration.expired && !effect.active,'Correct event did not suppress the expired effect');
            if(effect===condition) check(!actor.statuses.has('poisoned'),'Expired condition still poisons actor');
            else check(dagger.img===dagger._source.img,'Expired coating still changes dagger image');
            return {remaining:effect.duration.secondsRemaining,expired:true,active:effect.active,
              retained:true,poisoned:actor.statuses.has('poisoned')};
          });
        } finally {
          registry.delete(effect);
          await effect.update({disabled:true,duration:source.duration,start:source.start});
        }
      }
    }
  } finally {
    await combat.update({round:0,turn:null,active:false},{turnEvents:false});
    ui.combat.viewed=previousViewed ?? null;
  }
  output.combat=combat.uuid;
  output.finalState={worldTimeUnchanged:game.time.worldTime===time,paused:game.paused,
    combatStarted:combat.started,combatActive:combat.active,actors:actors.map(a=>({id:a.id,
      hp:a.system.attributes.hp.value,poisoned:a.statuses.has('poisoned')}))};
  output.status=output.errors.length?'failed':'passed';
  await save('effect-expiry',output);
  ui.notifications.info(`DM QA caducidad: ${output.checks.length} casos; ${output.errors.length} errores`);
  return output;
}

export async function crossActorExpiry() {
  guard(); const output=report();
  check(CONFIG.ActiveEffect.expiryAction==='update','This QA requires non-deleting effect expiry');
  const time=game.time.worldTime, previousViewed=game.combats.viewed;
  const actors=await Promise.all(['original','translated'].map(mode=>actorFor(mode,{extended:true})));
  const combat=game.combats.find(c=>c.getFlag(MODULE,FLAG)==='effect-expiry');
  check(combat && !combat.active && !combat.started && combat.combatants.size===2
    && combat.combatants.every(c=>actors.some(a=>a.id===c.actorId)),
    'Run effectExpiry() first and leave its QA encounter stopped');
  check(actors.every(a=>!a.statuses.has('poisoned')),'QA actors already poisoned');
  try {
    ui.combat.viewed=combat;
    check(game.combat===combat,'QA combat is not the current application context');
    for(const [index,source] of actors.entries()) {
      const mode=index===0?'original':'translated', target=actors[1-index];
      const sourceTurn=combat.turns.findIndex(c=>c.actorId===source.id);
      const targetTurn=combat.turns.findIndex(c=>c.actorId===target.id);
      const dagger=source.items.find(i=>i.getFlag(MODULE,FLAG)==='dmgDaggerOfVenom');
      const enchantment=dagger.effects.find(e=>e.getFlag(MODULE,FLAG)==='qa-poison-enchantment'
        && dagger.system.activities.some(a=>a.dependentOrigin?.id===e.id));
      check(enchantment?.disabled,'QA coating must exist and be disabled');
      for(const applicationTurn of ['source','target']) await step(output,`${mode}:apply-on-${applicationTurn}-turn`,async()=>{
        const turn=applicationTurn==='source'?sourceTurn:targetTurn;
        const opposite=turn===sourceTurn?targetTurn:sourceTurn;
        const registry=new ActiveEffect.implementation.registry.constructor();
        let applied;
        try {
          await combat.update({round:1,turn},{turnEvents:false});
          await enchantment.update({disabled:false});
          const poison=dagger.system.activities.find(a=>a.type==='save' && a.canUse);
          const activation=await poison.use({subsequentActions:false},{configure:false},
            {create:true,rollMode:'self',data:{system:{targets:[{actor:target.uuid}]}}});
          check(activation?.message,'Missing poison usage card');
          const card=activation.message;
          check(JSON.stringify(card._source.whisper)===JSON.stringify([game.user.id]),'QA card is not private');
          const profile=dagger.effects.get(poison.effects[0]._id);
          const existing=target.effects.find(e=>e._stats.duplicateSource===profile.uuid);
          const tray=document.createElement('effect-application');
          tray.chatMessage=card;
          applied=await tray._applyEffectToActor(profile,target);
          await applied.setFlag(MODULE,FLAG,'qa-cross-expiry');
          const recordedStart=foundry.utils.deepClone(applied._source.start);
          check(applied.parent===target && target.statuses.has('poisoned') && !source.statuses.has('poisoned'),
            'Poison applied to the wrong actor');
          check(recordedStart.combat===combat.id && recordedStart.combatant===combat.combatant.id,
            'Effect start is not anchored to the turn of application');
          check(applied._source.duration.value===60 && applied._source.duration.units==='seconds'
            && applied._source.duration.expiry==='turnStart','Duration differs from the official profile');
          if(existing) check(existing.id===applied.id,'Reapplication unexpectedly created a duplicate');
          // Keep the actual combatant chosen by application; move only the test timestamp.
          await applied.update({'start.time':time-59});
          registry.add(applied);
          check(registry.has(applied),'Applied QA condition is not tracked');
          await registry.refresh('turnStart',{combat,actors:new Set([target])});
          check(applied.duration.secondsRemaining===1 && applied.active,'Condition expired before 60 seconds');
          await applied.update({'start.time':time-60});
          await combat.update({turn:opposite},{turnEvents:false});
          await registry.refresh('turnStart',{combat,actors:new Set([target])});
          check(applied.duration.secondsRemaining===0 && applied.active && target.statuses.has('poisoned'),
            'Condition expired on a turn other than its recorded start combatant');
          await combat.update({turn},{turnEvents:false});
          await registry.refresh('turnStart',{combat,actors:new Set([target])});
          check(applied._source.duration.expired && !applied.active && !target.statuses.has('poisoned'),
            'Condition did not expire on its recorded start combatant turn');
          check(target.effects.has(applied.id),'Expiry deleted the QA condition');
          return {source:source.uuid,target:target.uuid,applicationTurn,operation:existing?'update':'create',
            effect:applied.uuid,card:card.uuid,recordedStart,expiryTurn:applicationTurn,
            activeAt59:true,activeAt60OnOtherTurn:true,expiredAt60OnRecordedTurn:true};
        } finally {
          if(applied) {
            registry.delete(applied);
            await applied.update({disabled:true});
          }
          await enchantment.update({disabled:true});
          check(actors.every(a=>!a.statuses.has('poisoned')),'QA poison did not clear');
        }
      });
    }
  } finally {
    await combat.update({round:0,turn:null,active:false},{turnEvents:false});
    ui.combat.viewed=previousViewed ?? null;
  }
  output.finalState={worldTimeUnchanged:game.time.worldTime===time,paused:game.paused,
    combatStarted:combat.started,combatActive:combat.active,actors:actors.map(a=>({id:a.id,
      hp:a.system.attributes.hp.value,poisoned:a.statuses.has('poisoned')}))};
  output.status=output.errors.length?'failed':'passed';
  await save('cross-actor-expiry',output);
  ui.notifications.info(`DM QA origen y objetivo: ${output.checks.length} casos; ${output.errors.length} errores`);
  return output;
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
