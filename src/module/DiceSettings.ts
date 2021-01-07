// @ts-ignore
import { COLORSETS, TEXTURELIST } from '/modules/dice-so-nice/DiceColors.js';

/**
 * This class defines a submenu for the system settings which will handle the DSN Settings
 */
export default class DiceSettings extends FormApplication {
  config: any;
  constructor(object = {}, options = { parent: null }) {
    super(object, options);
    this.config = CONFIG.SWADE.diceConfig;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: CONFIG.SWADE.diceConfig.id,
      title: CONFIG.SWADE.diceConfig.title,
      template: 'systems/swade/templates/dice-config.html',
      classes: ['swade', 'dice-config', 'dice-so-nice'],
      width: 500,
      height: 'auto',
      background: '#000',
      resizable: false,
      closeOnSubmit: false,
      submitOnClose: true,
      submitOnChange: true,
    });
  }

  /**
   * @override
   */
  activateListeners(html: JQuery) {
    super.activateListeners(html);

    html.find('#reset').on('click', () => this._resetSettings());
    html.find('#submit').on('click', () => this.close());
  }

  /**
   * @override
   */
  getData(): any {
    let settings = {};
    for (const setting of this.config.settings) {
      settings[setting] = game.settings.settings.get(`swade.${setting}`);
      settings[setting].value = game.settings.get('swade', setting);
      settings[setting].isCheckbox = settings[setting].type.name === 'Boolean';
      settings[setting].isObject = settings[setting].type.name === 'Object';
      if (setting === 'dsnWildDie') {
        settings[setting].isSelectOptGroup = true;
        settings[setting].groups = this._prepareColorsetList();
      }
    }

    return {
      settings,
      hasCustomWildDie: settings['dsnWildDie'].value !== 'custom',
      textureList: this._prepareTextureList(),
      fontList: this._prepareFontList(),
      materialList: this._prepareMaterialList(),
    };
  }

  async _updateObject(event, formData): Promise<void> {
    console.log(formData);
    let expandedFormdata = expandObject(formData) as any;
    //handle basic settings
    for (const [key, value] of Object.entries(expandedFormdata.swade)) {
      await game.settings.set('swade', key, value);
    }
    //handle custom wild die
    if (expandedFormdata.swade.dsnWildDie === 'custom') {
      await game.settings.set('swade', 'dsnCustomWildDie', {
        diceColor: expandedFormdata.diceColor,
        edgeColor: expandedFormdata.edgeColor,
        labelColor: expandedFormdata.labelColor,
        outlineColor: expandedFormdata.outlineColor,
      });
    }
    this.render(true);
  }

  async _resetSettings() {
    for (const setting of this.config.settings) {
      let resetValue = game.settings.settings.get(`swade.${setting}`).default;
      if (game.settings.get('swade', setting) !== resetValue) {
        await game.settings.set('swade', setting, resetValue);
      }
    }
    this.render(true);
  }

  private _prepareColorsetList() {
    const sets = this._deepCopyColorsets(COLORSETS);
    sets['none'] = {
      name: 'none',
      category: 'DICESONICE.Colors',
      description: 'SWADE.DSNNone',
    };
    let groupedSetsList = Object.values(sets) as any[];
    groupedSetsList.sort((set1: any, set2: any) => {
      if (
        game.i18n.localize(set1.description) <
        game.i18n.localize(set2.description)
      )
        return -1;
      if (
        game.i18n.localize(set1.description) >
        game.i18n.localize(set2.description)
      )
        return 1;
    });
    let preparedList = {};
    for (let i = 0; i < groupedSetsList.length; i++) {
      let locCategory = game.i18n.localize(groupedSetsList[i].category);
      if (!preparedList.hasOwnProperty(locCategory))
        preparedList[locCategory] = {};

      preparedList[locCategory][groupedSetsList[i].name] = game.i18n.localize(
        groupedSetsList[i].description,
      );
    }
    return preparedList;
  }

  private _prepareTextureList() {
    return Object.keys(TEXTURELIST).reduce((i18nCfg, key) => {
      i18nCfg[key] = TEXTURELIST[key].name;
      return i18nCfg;
    }, {});
  }

  private _prepareFontList() {
    let fontList = {
      auto: game.i18n.localize('DICESONICE.FontAuto'),
    };
    game.dice3d.box.dicefactory.fontFamilies.forEach((font) => {
      fontList[font] = font;
    });
    return fontList;
  }

  private _prepareMaterialList() {
    return {
      auto: 'DICESONICE.MaterialAuto',
      plastic: 'DICESONICE.MaterialPlastic',
      metal: 'DICESONICE.MaterialMetal',
      glass: 'DICESONICE.MaterialGlass',
      wood: 'DICESONICE.MaterialWood',
      chrome: 'DICESONICE.MaterialChrome',
    };
  }

  private _deepCopyColorsets(colorsets: any) {
    let deepCopy = {};
    for (const [key, value] of Object.entries(colorsets)) {
      deepCopy[duplicate(key)] = {
        name: duplicate(value['name']),
        category: duplicate(value['category']),
        description: duplicate(value['description']),
      };
    }
    return deepCopy;
  }
}
