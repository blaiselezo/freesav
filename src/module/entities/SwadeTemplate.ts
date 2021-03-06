import { TemplatePreset } from '../enums/TemplatePresetEnum';

/**
 * A helper class for building MeasuredTemplates for SWADE Burst Templates
 * @extends {MeasuredTemplate}
 * @noInheritDoc
 */
export default class SwadeTemplate extends MeasuredTemplate {
  moveTime = 0;

  //The initially active CanvasLayer to re-activate after the workflow is complete
  initialLayer: CanvasLayer = null;

  handlers = {
    mm: null,
    rc: null,
    lc: null,
    mw: null,
  };

  /**
   * A factory method to create a SwadeTemplate instance using provided preset
   * @param preset the preset to use.
   * @returns SwadeTemplate | null
   */
  static fromPreset(preset: TemplatePreset) {
    if (!preset) return null;

    // Prepare template data
    const templateData = {
      user: game.user._id,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user['color'],
    };

    //Set template data based on preset option
    switch (preset) {
      case TemplatePreset.CONE:
        templateData['t'] = 'cone';
        templateData['distance'] = 9;
        break;
      case TemplatePreset.SBT:
        templateData['t'] = 'circle';
        templateData['distance'] = 1;
        break;
      case TemplatePreset.MBT:
        templateData['t'] = 'circle';
        templateData['distance'] = 2;
        break;
      case TemplatePreset.LBT:
        templateData['t'] = 'circle';
        templateData['distance'] = 3;
        break;
      default:
        return null;
    }

    // Return the constructed template
    return new this(templateData);
  }

  /* -------------------------------------------- */

  /**
   * Creates a preview of the template
   * @param {Event} event   The initiating click event
   */
  drawPreview() {
    this.layer.preview.removeChildren();
    this.initialLayer = canvas.activeLayer;
    this.layer.preview.addChild(this);
    this.activatePreviewListeners();
    this.draw();
    this.layer.activate();
  }

  /* -------------------------------------------- */

  /**
   * Activate listeners for the template preview
   */
  activatePreviewListeners() {
    // Update placement (mouse-move)
    this.handlers.mm = (event) => {
      event.stopPropagation();
      const now = Date.now(); // Apply a 20ms throttle
      if (now - this.moveTime <= 20) return;
      const center = event.data.getLocalPosition(this.layer);
      const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
      this.data.x = snapped.x;
      this.data.y = snapped.y;
      this.refresh();
      this.moveTime = now;
    };

    // Cancel the workflow (right-click)
    this.handlers.rc = () => {
      this.layer.preview.removeChildren();
      canvas.stage.off('mousemove', this.handlers.mm);
      canvas.stage.off('mousedown', this.handlers.lc);
      canvas.app.view.oncontextmenu = null;
      canvas.app.view.onwheel = null;
      this.initialLayer.activate();
    };

    // Confirm the workflow (left-click)
    this.handlers.lc = (event) => {
      event.stopPropagation();
      this.handlers.rc(event);

      // Confirm final snapped position
      const destination = canvas.grid.getSnappedPosition(this.x, this.y, 2);
      this.data.x = destination.x;
      this.data.y = destination.y;

      // Create the template
      canvas.scene
        .createEmbeddedEntity('MeasuredTemplate', this.data)
        .then(() => this.destroy());
    };

    // Rotate the template by 3 degree increments (mouse-wheel)
    this.handlers.mw = (event) => {
      if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
      event.stopPropagation();
      const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
      const snap = event.shiftKey ? delta : 5;
      this.data.direction += snap * Math.sign(event.deltaY);
      this.refresh();
    };

    // Activate listeners
    canvas.stage.on('mousemove', this.handlers.mm);
    canvas.stage.on('mousedown', this.handlers.lc);
    canvas.app.view.oncontextmenu = this.handlers.rc;
    canvas.app.view.onwheel = this.handlers.mw;
  }

  destroy(...args) {
    super.destroy(...args);
    this.handlers.rc();
  }
}
