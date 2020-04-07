export const registerCustomHelpers = function () {
    Handlebars.registerHelper("localizeSkillAttribute", (attribute) => {
        return game.i18n.localize(CONFIG.SWADE.attributes[attribute]);
    });
}