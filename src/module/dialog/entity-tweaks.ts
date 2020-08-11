// eslint-disable-next-line no-unused-vars
import SwadeActor from '../entities/SwadeActor';
import SwadeItem from '../entities/SwadeItem';

export default class SwadeEntityTweaks extends FormApplication {
  object: Entity;
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'sheet-tweaks';
    options.template =
      'systems/swade/templates/actors/dialogs/tweaks-dialog.html';
    options.width = 380;
    return options;
  }

  /* -------------------------------------------- */

  /**
   * Add the Entity name into the window title
   * @type {String}
   */
  get title() {
    return `${this.object.name}: SWADE Tweaks`;
  }

  /* -------------------------------------------- */

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @return {Object}
   */
  getData() {
    let data = this.object.data;
    let settingFields = this._getAppropriateSettingFields();

    for (let [key, value] of Object.entries(settingFields)) {
      let fieldExists = getProperty(
        this.object.data,
        `data.additionalStats.${key}`,
      );
      if (fieldExists) {
        settingFields[key]['useField'] = true;
      }
    }
    data['autoCalc'] = {
      toughness: getProperty(
        this.object,
        'data.data.details.autoCalcToughness',
      ),
      armor: getProperty(this.object, 'data.data.details.autoCalcArmor'),
    };
    data['settingFields'] = settingFields;
    data['isActor'] = this._isActor();
    data['isCharacter'] = this.object.data.type === 'character';
    data['isNPC'] = this.object.data.type === 'npc';
    data['isVehicle'] = this.object.data.type === 'vehicle';
    data['shouldDisplayInit'] =
      this.object.data.type === 'character' ||
      this.object.data.type === 'npc' ||
      (this.object.data.type === 'vehicle' &&
        game.settings.get('swade', 'vehicleEdges'));
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  async _updateObject(event, formData: any) {
    event.preventDefault();
    let expandedFormData = expandObject(formData);

    //recombine the formdata
    setProperty(
      expandedFormData,
      'data.additionalStats',
      this._handleAdditionalStats(expandedFormData),
    );
    //flatten formdata
    let flattenedFormData = flattenObject(expandedFormData);
    // Update the actor
    this.object.update(flattenedFormData).then((entity: Entity) => {
      this.object.sheet.render(true);
    });
  }

  private _getAppropriateSettingFields(): any {
    let fields = game.settings.get('swade', 'settingFields');
    let settingFields = {};
    if (this.object instanceof SwadeActor) {
      settingFields = fields.actor;
    } else if (this.object instanceof SwadeItem) {
      settingFields = fields.item;
    }
    return settingFields;
  }

  private _handleAdditionalStats(expandedFormData: any): any {
    let formFields = expandedFormData['data']['additionalStats'] || {};
    const prototypeFields = this._getAppropriateSettingFields();
    let newFields = duplicate(
      getProperty(this.object.data, 'data.additionalStats'),
    );
    //handle setting specific fields
    for (let [key, value] of Object.entries(formFields)) {
      let fieldExistsOnEntity = getProperty(
        this.object.data,
        `data.additionalStats.${key}`,
      );
      if (value['useField'] && fieldExistsOnEntity) {
        //update exisiting field;
        newFields[key]['hasMaxValue'] = prototypeFields[key]['hasMaxValue'];
        newFields[key]['dtype'] = prototypeFields[key]['dtype'];
        if (newFields[key]['dtype'] === 'Boolean') {
          newFields[key]['-=max'] = null;
        }
      } else if (value['useField'] && !fieldExistsOnEntity) {
        //add new field
        newFields[key] = prototypeFields[key];
      } else {
        //delete field
        newFields[`-=${key}`] = null;
      }
    }

    //handle "stray" fields that exist on the actor but have no prototype
    for (let key of Object.keys(
      getProperty(this.object.data, 'data.additionalStats'),
    )) {
      if (!prototypeFields[key]) {
        newFields[`-=${key}`] = null;
      }
    }
    return newFields;
  }

  private _isActor() {
    return (
      this.object.data.type === 'character' ||
      this.object.data.type === 'npc' ||
      this.object.data.type === 'vehicle'
    );
  }
}
