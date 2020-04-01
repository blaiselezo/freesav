export const registerCustomHelpers = function () {
    Handlebars.registerHelper("localizeSkillAttribute", (attribute: String) => {
        //return game.i18n.localize(CONFIG.SWADE.stuff);
        return attribute.toUpperCase();
    });
}