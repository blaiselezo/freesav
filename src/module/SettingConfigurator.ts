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
    data['charSettingStats'] = game.settings.get('swade', 'arbitraryStats');
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
    let expandedFormdata = expandObject(formData) as any;
    let rules = expandedFormdata.settingRules;

    for (const key in rules) {
      let settingValue = rules[key];
      if (
        this.config.settings.includes(key) &&
        settingValue !== game.settings.get('swade', key)
      ) {
        await game.settings.set('swade', key, settingValue);
      }
    }

    let charData = game.settings.get('swade', 'arbitraryStats');

    // Handle the free-form attributes list
    const charAttributes = Object.values(
      expandedFormdata.charSettingStats,
    ).reduce((obj, v: any) => {
      if (!v.key) console.log(expandedFormdata.charSettingStats);
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

    // Remove attributes which are no longer used
    for (let k of Object.keys(charData)) {
      //if (!charAttributes.hasOwnProperty(k)) charAttributes[`-=${k}`] = null;
      if (!charAttributes.hasOwnProperty(k)) delete charAttributes[k];
    }

    // Re-combine formData
    // let newFormData = Object.entries(formData)
    //   .filter((e) => !e[0].startsWith('charSettingStats'))
    //   .reduce(
    //     (obj, e) => {
    //       obj[e[0]] = e[1];
    //       return obj;
    //     },
    //     { charSettingStats: charAttributes },
    //   );

    game.settings.set('swade', 'arbitraryStats', charAttributes);
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
    const attrs = game.settings.get('swade', 'arbitraryStats');
    const form = this.form;

    // Add new attribute
    if (action === 'createChar') {
      const nk = Object.keys(attrs).length + 1;
      let newElement = document.createElement('div');
      newElement.innerHTML = `<input type="text" name="charSettingStats.attr${nk}.key" value="attr${nk}"/>`;
      let newKey = newElement.children[0];
      form.appendChild(newKey);
      await this._onSubmit(event);
      this.render(true);
    }

    // if (action === 'createItem') {
    //   const nk = Object.keys(attrs).length + 1;
    //   let newElement = document.createElement('div');
    //   newElement.innerHTML = `<input type="text" name="itemSettingStats.attr${nk}.key" value="attr${nk}"/>`;
    //   let newKey = newElement.children[0];
    //   form.appendChild(newKey);
    //   await this._onSubmit(event);
    //   this.render(true);
    // }

    // Remove existing attribute
    else if (action === 'delete') {
      const li = a.closest('.attribute');
      li.parentElement.removeChild(li);
      await this._onSubmit(event);
    }
  }
}
