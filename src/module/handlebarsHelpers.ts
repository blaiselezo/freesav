export const registerCustomHelpers = function () {
    // Common helpers
    Handlebars.registerHelper("eq", (lh, rh) => {
        return lh == rh;
    })

    // Sheet
    Handlebars.registerHelper("localizeSkillAttribute", (attribute) => {
        return game.i18n.localize(CONFIG.SWADE.attributes[attribute]);
    });
    Handlebars.registerHelper("modifier", (str) => {
        str = str === "" || str === null ? "0" : str;
        let value = typeof str == "string" ? parseInt(str) : str;
        return value == 0 ? "" : (value > 0 ? ` + ${value}` : ` - ${-value}`);
    })
}