// eslint-disable-next-line no-unused-vars
import SwadeActor from '../entities/SwadeActor';

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
    console.log(this.object);
    let data = this.object.data;
    if (this.object.data.type === 'character') {
      data.isCharacter = true;
    }
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    //Configre initiative Edges/Hindrances
    html.find('#initConfigButton').click(() => {
      let actorObject = this.object as SwadeActor;
      actorObject.configureInitiative();
    });
  }

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  async _updateObject(event, formData: any) {
    event.preventDefault();
    // Update the actor
    this.object.update(formData);
    // Re-draw the updated sheet
    this.object.sheet.render(true);
  }
}
