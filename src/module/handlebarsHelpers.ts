export const registerCustomHelpers = function () {
    // Common helpers
    Handlebars.registerHelper('eq', (lh, rh) => {
        return lh == rh;
    })

    Handlebars.registerHelper('gt', (lh, rh) => {
        return lh >= rh;
    })

    Handlebars.registerHelper('isEmpty', (element) => {
        if (typeof element === undefined) return true;
        if (Array.isArray(element) && element.length) return false;
        if (element === '') return true
    });

    // Sheet
    Handlebars.registerHelper('localizeSkillAttribute', (attribute) => {
        if (!attribute) return '';
        return game.i18n.localize(CONFIG.SWADE.attributes[attribute].short);
    });

    Handlebars.registerHelper('modifier', (str) => {
        str = str === '' || str === null ? '0' : str;
        let value = typeof str == 'string' ? parseInt(str) : str;
        return value == 0 ? '' : (value > 0 ? ` + ${value}` : ` - ${-value}`);
    })
}