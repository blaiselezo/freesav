// eslint-disable-next-line no-unused-vars
import SwadeActor from '../entities/SwadeActor';
import SwadeItem from '../entities/SwadeItem';

export default class SwadeEntityTweaks extends FormApplication {
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

    data.settingFields = settingFields;
    data.isActor = this.object instanceof SwadeActor;
    data.isCharacter = this.object.data.type === 'character';
    data.isVehicle = this.object.data.type === 'vehicle';
    data.shouldDisplayInit =
      this instanceof SwadeActor ||
      (data.isVehicle && game.settings.get('swade', 'vehicleEdges'));
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
    const fields = this._getAppropriateSettingFields();
    let expandedFormData = expandObject(formData);
    let formFields = expandedFormData['data']['additionalStats'];
    let newFields = {};
    //handle setting specific fields
    for (let [key, value] of Object.entries(formFields)) {
      let fieldExistsOnEntity = getProperty(
        this.object.data,
        `data.additionalStats.${key}`,
      );
      if (value['useField'] && fieldExistsOnEntity) {
        //update exisiting field;
        newFields[key] = mergeObject(fieldExistsOnEntity, fields[key], {
          insertKeys: true,
          insertValues: true,
          overwrite: true,
        });
      } else if (value['useField'] && !fieldExistsOnEntity) {
        //add new field
        newFields[key] = fields[key];
      } else {
        //delete field
        newFields[`-=${key}`] = null;
      }
    }

    //handle "stray" fields that exist on the actor but have no prototype
    for (let key of Object.keys(
      getProperty(this.object.data, 'data.additionalStats'),
    )) {
      if (!fields[key]) {
        newFields[`-=${key}`] = null;
      }
    }

    setProperty(expandedFormData, 'data.additionalStats', newFields);
    // Update the actor
    this.object.update(flattenObject(expandedFormData));
    // Re-draw the updated sheet
    this.object.sheet.render(true);
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
}
