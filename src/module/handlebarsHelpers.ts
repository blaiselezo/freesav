import SwadeItem from './entities/SwadeItem';

export const registerCustomHelpers = function () {
  Handlebars.registerHelper('add', (lh, rh) => {
    return lh + rh;
  });
  Handlebars.registerHelper('isEmpty', (element) => {
    if (typeof element === undefined) return true;
    if (Array.isArray(element) && element.length) return false;
    if (element === '') return true;
  });

  // Sheet
  Handlebars.registerHelper('localizeSkillAttribute', (attribute) => {
    if (!attribute) return '';
    return game.i18n.localize(CONFIG.SWADE.attributes[attribute].short);
  });

  Handlebars.registerHelper('modifier', (str) => {
    str = str === '' || str === null ? '0' : str;
    let value = typeof str == 'string' ? parseInt(str) : str;
    return value == 0 ? '' : value > 0 ? ` + ${value}` : ` - ${-value}`;
  });

  Handlebars.registerHelper('enrich', (content) => {
    return new Handlebars.SafeString(TextEditor.enrichHTML(content, {}));
  });

  Handlebars.registerHelper('canBeEquipped', (item: SwadeItem) => {
    return item.data['equippable'] || item.data['isVehicular'];
  });
};
