/**
 * A helper class for building MeasuredTemplates for SWADE Burst Templates
 * @extends {MeasuredTemplate}
 */
export default class SwadeTemplate extends MeasuredTemplate {
  /**
   * A factory method to create a BurstTemplate instance using provided radius
   * @param radius radius of the burst template
   * @returns BurstTemplate | null
   */
  static fromData(distance: number, shape: string) {
    if (!distance || !shape) return null;

    // Prepare template data
    const templateData = {
      t: shape,
      user: game.user._id,
      distance: distance,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user['color'],
    };

    // Return the constructed template
    return new this(templateData);
  }

  /* -------------------------------------------- */

  /**
   * Creates a preview of the template
   * @param {Event} event   The initiating click event
   */
  drawPreview(event) {
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
        let now = Date.now(); // Apply a 20ms throttle
        if (now - moveTime <= 20) return;
        const center = event.data.getLocalPosition(this.layer);
        const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
        this.data.x = snapped.x;
        this.data.y = snapped.y;
        this.refresh();
        moveTime = now;
      },

      // Cancel the workflow (right-click)
      rc: (event) => {
        this.layer.preview.removeChildren();
        canvas.stage.off('mousemove', handlers.mm);
        canvas.stage.off('mousedown', handlers.lc);
        canvas.app.view.oncontextmenu = null;
        canvas.app.view.onwheel = null;
        initialLayer.activate();
      },

      // Confirm the workflow (left-click)
      lc: (event) => {
        handlers.rc(event);

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
        let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
        let snap = event.shiftKey ? delta : 5;
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
