// Run as a Script macro after reloading Testing with the patched language module active.
export async function validateTargetGrammar() {
  const check=(condition,message)=>{if(!condition) throw new Error(message);};
  check(game.user.isGM && game.world.id==='testing','Use Testing as GM');
  check(game.system.version==='6.0.3' && game.i18n.lang==='es','Use dnd5e 6.0.3 in Spanish');
  check(game.modules.get('ravanno-dnd5e-es')?.active,'Activate the language module and reload');
  const {adjustSpanishTargetLabels}=await import('/modules/ravanno-dnd5e-es/target-labels-es-6.0.3.mjs');
  const field=game.dnd5e.dataModels.shared.TargetField;
  const cases=[];
  const localize=key=>game.i18n.localize(key);
  const format=(key,data)=>game.i18n.format(key,data);
  for (const [type,config] of Object.entries(CONFIG.DND5E.individualTargetTypes)) {
    if(!config.counted) continue;
    for(const count of [null,1,2]) {
      const target={template:{type:''},affects:{type,count,special:''}};
      cases.push({name:`individual:${type}:${count??'any'}`,target,
        sheet:count?`${count} ${localize(`${config.counted}.${count===1?'one':'other'}`)}`.capitalize():localize(`${config.counted}.any`).capitalize()});
    }
  }
  for (const [type,config] of Object.entries(CONFIG.DND5E.areaTargetTypes)) {
    if(!config.counted) continue;
    for(const count of [1,2]) cases.push({name:`area:${type}:${count}`,
      target:{template:{type,count,size:20,width:5,height:5,units:'ft'},affects:{type:'creature',count:null,special:''}},
      sheet:'Todas las criaturas'});
  }
  cases.push({name:'special:one',target:{template:{type:''},affects:{type:'creature',count:1,special:'estatua'}},description:'1 estatua'});
  cases.push({name:'special:two',target:{template:{type:''},affects:{type:'creature',count:2,special:'estatuas'}},description:'dos estatuas'});
  const results=[];
  for(const test of cases) {
    const before=JSON.stringify(test.target), labels=field.getLabels({target:test.target});
    check(JSON.stringify(test.target)===before,`Target data changed: ${test.name}`);
    check(!/undefined|\{number\}|\buno\b|\bcualquiera\b/i.test(JSON.stringify(labels)),`Uncorrected label: ${test.name}`);
    if(test.sheet) check(labels.affects.sheet===test.sheet,`Wrong sheet label: ${test.name}`);
    if(test.description) check(labels.affects.description===test.description,`Wrong description: ${test.name}`);
    if(test.target.affects.count===1) check(labels.affects.description.startsWith('1 '),`Wrong singular count: ${test.name}`);
    results.push({name:test.name,labels});
  }
  const englishLabels={affects:{sheet:'Any creatures',description:'one creature',statblock:'one creature'},template:{}};
  const untouched=JSON.stringify(englishLabels);
  adjustSpanishTargetLabels(englishLabels,cases[0],{language:'en',types:CONFIG.DND5E.individualTargetTypes,localize,format});
  check(JSON.stringify(englishLabels)===untouched,'English labels changed');
  const report={date:new Date().toISOString(),world:game.world.id,foundry:game.version,system:game.system.version,
    status:'passed',cases:results.length,englishUnchanged:true,targetDataUnchanged:true,results};
  const saved=await foundry.applications.apps.FilePicker.upload('data','modules/translate-dnd5e-dm-2024-es/tmp',
    new File([JSON.stringify(report,null,2)+'\n'],'target-grammar-validation.json',{type:'application/json'}),{},{notify:false});
  check(saved?.path,'Could not save evidence');
  ui.notifications.info(`Concordancia: ${results.length} casos correctos; datos e inglés conservados.`);
  return report;
}
