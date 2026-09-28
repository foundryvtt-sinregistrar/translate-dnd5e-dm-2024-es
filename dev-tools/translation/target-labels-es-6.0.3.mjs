// Local compatibility patch for ravanno-dnd5e-es with dnd5e 6.0.3.
// This file is copied into that module; DM does not load it.
export function adjustSpanishTargetLabels(labels, {target}, {language, types, localize, format}) {
  if (language?.split('-')[0] !== 'es') return labels;
  const counted=types[target.affects.type]?.counted;
  const count=target.affects.count;
  if (counted && !count) {
    // These existing, complete phrases carry the noun's gender and number.
    labels.affects.sheet=localize(`${counted}.${target.template.type?'every':'any'}`).capitalize();
  }
  const type=counted??'DND5E.TARGET.Type.Target.Counted';
  if (Number(count)===1) {
    const descriptionType=target.affects.special?'DND5E.TARGET.Type.Special.Counted':type;
    labels.affects.description=format('DND5E.TARGET.Formatted',{
      count:'1',type:format(`${descriptionType}.one`,{special:target.affects.special})
    }).trim();
  }
  if (!count || Number(count)===1) {
    labels.affects.statblock=format('DND5E.TARGET.Formatted',{
      count:'1',type:format(`${type}.one`,{})
    }).trim();
  }
  return labels;
}

Hooks.once('init',()=>{
  if (game.system.id!=='dnd5e' || game.system.version!=='6.0.3') return;
  if (!game.modules.get('lib-wrapper')?.active) return;
  libWrapper.register('ravanno-dnd5e-es','dnd5e.dataModels.shared.TargetField.getLabels',
    function(wrapped,data) {
      return adjustSpanishTargetLabels(wrapped(data),data,{
        language:game.i18n.lang,types:CONFIG.DND5E.individualTargetTypes,
        localize:key=>game.i18n.localize(key),format:(key,data)=>game.i18n.format(key,data)
      });
    },'WRAPPER');
});
