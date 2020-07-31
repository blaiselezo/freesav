export default class SettingConfigurator extends FormApplication {
  config: any;
  settingStats: any;
  constructor(object = {}, options = { parent: null }) {
    super(object, options);
    this.config = CONFIG.SWADE.settingConfig;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: CONFIG.SWADE.settingConfig.id,
      title: CONFIG.SWADE.settingConfig.title,
      template: 'systems/swade/templates/setting-config.html',
      classes: ['swade', 'setting-config'],
      width: 600,
      height: 'auto',
      top: 200,
      left: 400,
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
  getData() {
    let data = {};
    let settingRules = {};
    for (const setting of this.config.settings) {
      settingRules[setting] = game.settings.get('swade', setting);
    }
    data['settingRules'] = settingRules;

    let settingFields = game.settings.get('swade', 'settingFields');
    data['actorSettingStats'] = settingFields.actor;
    data['itemSettingStats'] = settingFields.item;
    data['dtypes'] = ['String', 'Number', 'Boolean'];
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('#reset').click((ev) => this._resetSettings(ev));
    html
      .find('.attributes')
      .on(
        'click',
        '.attribute-control',
        this._onClickAttributeControl.bind(this),
      );
  }

  async _updateObject(event, formData) {
    //Gather Data
    let expandedFormdata = expandObject(formData) as any;
    console.log('expandedFormdata', expandedFormdata);
    let formActorAttrs = expandedFormdata.actorSettingStats || {};
    let formItemAttrs = expandedFormdata.itemSettingStats || {};

    //Set the "easy" settings
    for (const key in expandedFormdata.settingRules) {
      let settingValue = expandedFormdata.settingRules[key];
      if (
        this.config.settings.includes(key) &&
        settingValue !== game.settings.get('swade', key)
      ) {
        await game.settings.set('swade', key, settingValue);
      }
    }

    // Handle the free-form attributes list
    let settingFields = game.settings.get('swade', 'settingFields');
    let actorFieldData = settingFields['actor'];
    let itemFieldData = settingFields['item'];

    let actorAttributes = this._handleKeyValidityCheck(formActorAttrs);
    let itemAttributes = this._handleKeyValidityCheck(formItemAttrs);
    let saveValue = {
      actor: this._handleDeletableAttributes(actorAttributes, actorFieldData),
      item: this._handleDeletableAttributes(itemAttributes, itemFieldData),
    };
    await game.settings.set('swade', 'settingFields', saveValue);
  }

  async _resetSettings(event: Event) {
    for (const setting of this.config.settings) {
      let resetValue = game.settings.settings.get(`swade.${setting}`).default;
      if (game.settings.get('swade', setting) !== resetValue) {
        await game.settings.set('swade', setting, resetValue);
      }
    }
    this.render(true);
  }

  async _onClickAttributeControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const action = a.dataset.action;
    let settingFields = game.settings.get('swade', 'settingFields');
    const form = this.form;

    // Add new attribute
    if (action === 'createChar') {
      const nk = Object.keys(settingFields.actor).length + 1;
      let newElement = document.createElement('div');
      newElement.innerHTML = `<input type="text" name="charSettingStats.attr${nk}.key" value="attr${nk}"/>`;
      let newKey = newElement.children[0];
      form.appendChild(newKey);
      await this._onSubmit(event);
      this.render(true);
    }

    if (action === 'createItem') {
      const nk = Object.keys(settingFields.item).length + 1;
      let newElement = document.createElement('div');
      newElement.innerHTML = `<input type="text" name="itemSettingStats.attr${nk}.key" value="attr${nk}"/>`;
      let newKey = newElement.children[0];
      form.appendChild(newKey);
      await this._onSubmit(event);
      this.render(true);
    }

    // Remove existing attribute
    if (action === 'delete') {
      const li = a.closest('.attribute');
      li.parentElement.removeChild(li);
      this._onSubmit(event).then(() => this.render(true));
    }
  }

  private _handleKeyValidityCheck(attributes: any): any {
    return Object.values(attributes).reduce((obj, v) => {
      let k = v['key'].trim();
      if (/[\s\.]/.test(k)) {
        return ui.notifications.error(
          'Attribute keys may not contain spaces or periods',
        );
      }
      delete v['key'];
      obj[k] = v;
      return obj;
    }, {});
  }

  /**
   * Remove attributes which are no longer use
   * @param attributes
   * @param base
   */
  private _handleDeletableAttributes(attributes: any, base: any) {
    for (let k of Object.keys(base)) {
      if (!attributes.hasOwnProperty(k)) {
        delete attributes[k];
      }
    }
    return attributes;
  }
}
