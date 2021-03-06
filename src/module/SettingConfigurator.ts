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
    const data = {};
    const settingRules = {};
    for (const setting of this.config.settings) {
      settingRules[setting] = game.settings.get('swade', setting);
    }
    data['settingRules'] = settingRules;

    const settingFields = game.settings.get('swade', 'settingFields');
    data['actorSettingStats'] = settingFields.actor;
    data['itemSettingStats'] = settingFields.item;
    data['dtypes'] = ['String', 'Number', 'Boolean'];
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('#reset').click(() => this._resetSettings());
    html.find('#submit').click(() => this.close());
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
    const expandedFormdata = expandObject(formData) as any;
    const formActorAttrs = expandedFormdata.actorSettingStats || {};
    const formItemAttrs = expandedFormdata.itemSettingStats || {};

    //Set the "easy" settings
    for (const key in expandedFormdata.settingRules) {
      const settingValue = expandedFormdata.settingRules[key];
      if (
        this.config.settings.includes(key) &&
        settingValue !== game.settings.get('swade', key)
      ) {
        await game.settings.set('swade', key, settingValue);
      }
    }

    // Handle the free-form attributes list
    const settingFields = game.settings.get('swade', 'settingFields');

    const actorAttributes = this._handleKeyValidityCheck(formActorAttrs);
    const itemAttributes = this._handleKeyValidityCheck(formItemAttrs);
    const saveValue = {
      actor: this._handleDeletableAttributes(
        actorAttributes,
        settingFields.actor,
      ),
      item: this._handleDeletableAttributes(itemAttributes, settingFields.item),
    };
    await game.settings.set('swade', 'settingFields', saveValue);
  }

  async _resetSettings() {
    for (const setting of this.config.settings) {
      const resetValue = game.settings.settings.get(`swade.${setting}`).default;
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
    const settingFields = game.settings.get('swade', 'settingFields');
    const form = this.form;

    // Add new attribute
    if (action === 'createChar') {
      const nk = Object.keys(settingFields.actor).length + 1;
      const newElement = document.createElement('div');
      newElement.innerHTML = `<input type="text" name="actorSettingStats.attr${nk}.key" value="attr${nk}"/>`;
      const newKey = newElement.children[0];
      form.appendChild(newKey);
      await this._onSubmit(event);
      this.render(true);
    }

    if (action === 'createItem') {
      const nk = Object.keys(settingFields.item).length + 1;
      const newElement = document.createElement('div');
      newElement.innerHTML = `<input type="text" name="itemSettingStats.attr${nk}.key" value="attr${nk}"/>`;
      const newKey = newElement.children[0];
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
      const k = v['key'].trim();
      if (/[\s.]/.test(k)) {
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
    for (const k of Object.keys(base)) {
      if (!attributes.hasOwnProperty(k)) {
        delete attributes[k];
      }
    }
    return attributes;
  }
}
