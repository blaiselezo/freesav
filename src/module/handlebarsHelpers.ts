import { SWADE } from './config';
import SwadeItem from './entities/SwadeItem';

export const registerCustomHelpers = function () {
  Handlebars.registerHelper('add', function (a, b) {
    const result = parseInt(a) + parseInt(b);
    return result.signedString();
  });

  Handlebars.registerHelper('signedString', function (number) {
    const result = parseInt(number);
    if (isNaN(result)) return '';
    return result.signedString();
  });

  Handlebars.registerHelper('times', function (a, b) {
    return a * b;
  });

  Handlebars.registerHelper('isEmpty', (element) => {
    if (typeof element === undefined) return true;
    if (Array.isArray(element) && element.length) return false;
    if (element === '') return true;
  });

  // Sheet
  Handlebars.registerHelper('localizeSkillAttribute', (attribute) => {
    if (!attribute) return '';
    return game.i18n.localize(SWADE.attributes[attribute].long);
  });

  Handlebars.registerHelper('modifier', (str) => {
    str = str === '' || str === null ? '0' : str;
    const value = typeof str == 'string' ? parseInt(str) : str;
    return value == 0 ? '' : value > 0 ? ` + ${value}` : ` - ${-value}`;
  });

  Handlebars.registerHelper('enrich', (content) => {
    return new Handlebars.SafeString(TextEditor.enrichHTML(content, {}));
  });

  Handlebars.registerHelper('canBeEquipped', (item: SwadeItem) => {
    return item.data['equippable'] || item.data['isVehicular'];
  });

  Handlebars.registerHelper('disabled', (value) => {
    return value ? 'disabled' : '';
  });

  Handlebars.registerHelper('capitalize', (str) => {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
};
