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
    let fields = game.settings.get('swade', 'settingFields');
    let settingFields;

    if (this.object instanceof SwadeActor) {
      settingFields = fields.actor;
    } else if (this.object instanceof SwadeItem) {
      settingFields = fields.item;
    }

    for (let [key, value] of Object.entries(settingFields)) {
      let fieldExists = getProperty(
        this.object.data,
        `data.settingSpecific.${key}`,
      );
      if (fieldExists) {
        settingFields[key]['useField'] = true;
      }
    }

    data.settingFields = settingFields;
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
    const fields = game.settings.get('swade', 'settingFields').actor;
    let expandedFormData = expandObject(formData);
    let settingFields = expandedFormData['data']['settingSpecific'];
    let newFields = {};
    for (let [key, value] of Object.entries(settingFields)) {
      let fieldExistsOnEntity = getProperty(
        this.object.data,
        `data.settingSpecific.${key}`,
      );
      if (!value['useField'] && fieldExistsOnEntity) {
        newFields[`-=${key}`] = null;
      } else if (value['useField'] && !fieldExistsOnEntity) {
        newFields[key] = fields[key];
      }
    }

    setProperty(expandedFormData, 'data.settingSpecific', newFields);
    console.log(expandObject(expandedFormData));
    // Update the actor
    this.object.update(flattenObject(expandedFormData));
    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }
}
