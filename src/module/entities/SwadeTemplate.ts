import { TemplatePreset } from '../enums/TemplatePresetEnum';

/**
 * A helper class for building MeasuredTemplates for SWADE Burst Templates
 * @extends {MeasuredTemplate}
 * @noInheritDoc
 */
export default class SwadeTemplate extends MeasuredTemplate {
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
    const initialLayer = canvas.activeLayer;
    this.draw();
    this.layer.activate();
    this.layer.preview.addChild(this);
    this.activatePreviewListeners(initialLayer);
  }

  /* -------------------------------------------- */

  /**
   * Activate listeners for the template preview
   * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
   */
  activatePreviewListeners(initialLayer) {
    let moveTime = 0;
    const handlers = {
      // Update placement (mouse-move)
      mm: (event) => {
        event.stopPropagation();
        const now = Date.now(); // Apply a 20ms throttle
        if (now - moveTime <= 20) return;
        const center = event.data.getLocalPosition(this.layer);
        const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
        this.data.x = snapped.x;
        this.data.y = snapped.y;
        this.refresh();
        moveTime = now;
      },

      // Cancel the workflow (right-click)
      // eslint-disable-next-line no-unused-vars
      rc: () => {
        this.layer.preview.removeChildren();
        canvas.stage.off('mousemove', handlers.mm);
        canvas.stage.off('mousedown', handlers.lc);
        canvas.app.view.oncontextmenu = null;
        canvas.app.view.onwheel = null;
        initialLayer.activate();
      },

      // Confirm the workflow (left-click)
      lc: () => {
        handlers.rc();

        // Confirm final snapped position
        const destination = canvas.grid.getSnappedPosition(this.x, this.y, 2);
        this.data.x = destination.x;
        this.data.y = destination.y;

        // Create the template
        canvas.scene.createEmbeddedEntity('MeasuredTemplate', this.data);
      },

      // Rotate the template by 3 degree increments (mouse-wheel)
      mw: (event) => {
        if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
        event.stopPropagation();
        const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
        const snap = event.shiftKey ? delta : 5;
        this.data.direction += snap * Math.sign(event.deltaY);
        this.refresh();
      },
    };

    // Activate listeners
    canvas.stage.on('mousemove', handlers.mm);
    canvas.stage.on('mousedown', handlers.lc);
    canvas.app.view.oncontextmenu = handlers.rc;
    canvas.app.view.onwheel = handlers.mw;
  }
}
