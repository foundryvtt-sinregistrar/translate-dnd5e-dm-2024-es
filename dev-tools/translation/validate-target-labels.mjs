// Explicit development macro: tests the installed system without persisting translations.
const ROOT='/modules/translate-dnd5e-dm-2024-es';
const requireCheck=(condition,message)=>{if(!condition) throw new Error(message);};
async function read(url) {
  const response=await fetch(url,{cache:'no-store'});
  requireCheck(response.ok,`Cannot load ${url}`);
  return response.json();
}
export async function validateTargetLabels({patchedInstallation=false}={}) {
  requireCheck(game.user.isGM && game.world.id==='testing','Use Testing as GM');
  requireCheck(game.system.version==='6.0.3','This diagnostic targets dnd5e 6.0.3');
  const [en,es,patch]=await Promise.all([
    read('/systems/dnd5e/lang/en.json'),read('/modules/ravanno-dnd5e-es/lang/es.json'),
    read(`${ROOT}/dev-tools/translation/target-labels-6.0.3.patch.json`)
  ]);
  const expand=foundry.utils.expandObject;
  const english=expand(en), spanish=expand(es), changes=expand(patch);
  const get=foundry.utils.getProperty;
  const beforeSpanish=structuredClone(spanish);
  for(const [key,value] of Object.entries(patch)) {
    requireCheck(get(spanish,key)===(patchedInstallation?value:`{number} ${value}`),`Unexpected installed source: ${key}`);
    if(patchedInstallation) foundry.utils.setProperty(beforeSpanish,key,`{number} ${value}`);
    requireCheck(!get(english,key)?.includes('{number}'),`Official source still requires number: ${key}`);
    requireCheck(value.replace('{special}','')===get(english,key).replace('{special}','')
      || /\{special\}/.test(value)===/\{special\}/.test(get(english,key)),`Changed special token: ${key}`);
  }
  const targetField=game.dnd5e.dataModels.shared.TargetField;
  const cases=[];
  for(const [type,config] of Object.entries(CONFIG.DND5E.individualTargetTypes)) {
    if(!config.counted) continue;
    for(const count of [null,1,2]) cases.push({name:`individual:${type}:${count??'any'}`,
      target:{template:{type:''},affects:{type,count,special:''}}});
  }
  for(const [type,config] of Object.entries(CONFIG.DND5E.areaTargetTypes)) {
    if(!config.counted) continue;
    for(const count of [1,2]) cases.push({name:`area:${type}:${count}`,
      target:{template:{type,count,size:20,width:5,height:5,units:'ft'},affects:{type:'creature',count:null,special:''}}});
  }
  cases.push({name:'special:two',target:{template:{type:''},affects:{type:'creature',count:2,special:'ejemplares'}}});
  const saved=game.i18n.translations;
  const merge=foundry.utils.mergeObject;
  const labels=()=>cases.map(c=>({name:c.name,labels:targetField.getLabels({target:c.target})}));
  let live=null;
  if(patchedInstallation) {
    requireCheck(game.modules.get('ravanno-dnd5e-es')?.active,'Enable the patched language module and reload');
    requireCheck(game.i18n.lang==='es','Use Spanish and reload');
    for(const [key,value] of Object.entries(patch)) requireCheck(game.i18n.localize(key)===value,`Live dictionary differs: ${key}`);
    live=labels();
  }
  let original,broken,fixed;
  try {
    // No awaits in this block: restore before any browser event or unrelated document preparation.
    game.i18n.translations=merge(structuredClone(saved),english);
    original=labels();
    game.i18n.translations=merge(structuredClone(saved),beforeSpanish);
    broken=labels();
    game.i18n.translations=merge(structuredClone(game.i18n.translations),changes);
    fixed=labels();
  } finally { game.i18n.translations=saved; }
  const invalid=value=>/undefined|\{number\}/i.test(JSON.stringify(value));
  requireCheck(broken.some(invalid),'The reported defect was not reproduced');
  requireCheck(!original.some(invalid),'Unexpected defect with original English strings');
  requireCheck(!fixed.some(invalid),'Proposed patch leaves invalid labels');
  if(live) requireCheck(!live.some(invalid),'Installed patch leaves invalid live labels');
  requireCheck(game.i18n.translations===saved,'Original translation dictionary not restored');
  const report={date:new Date().toISOString(),foundry:game.version,system:game.system.version,
    dependency:game.modules.get('ravanno-dnd5e-es')?.version,world:game.world.id,
    activeModules:[...game.modules].filter(m=>m.active).map(m=>m.id),status:'passed',
    replacements:Object.keys(patch).length,cases:cases.length,originalFailures:original.filter(invalid).length,
    mode:patchedInstallation?'patched-installation':'original-installation',
    beforeSource:patchedInstallation?'reconstructed from validated replacement map':'installed dictionary',
    beforeFailures:broken.filter(invalid).length,patchedFailures:fixed.filter(invalid).length,
    liveFailures:live?live.filter(invalid).length:null,
    restored:true,results:cases.map((c,i)=>({name:c.name,original:original[i].labels,
      before:broken[i].labels,patched:fixed[i].labels,...(live?{live:live[i].labels}:{})}))};
  const result=await foundry.applications.apps.FilePicker.upload('data',
    'modules/translate-dnd5e-dm-2024-es/tmp',new File([JSON.stringify(report,null,2)+'\n'],
      patchedInstallation?'target-labels-installed-validation.json':'target-labels-validation.json',
      {type:'application/json'}),{},{notify:false});
  requireCheck(result?.path,'Could not save local diagnostic evidence');
  ui.notifications.info(`Target labels: ${cases.length} cases passed; ${report.replacements} replacements; ${report.mode}; dictionary restored.`);
  return report;
}
