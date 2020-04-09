export const listenJournalDrop = function () {
  // Grabbing the image url from the journal entry
  function _onDragStart(event: any) {
    event.stopPropagation();
    let url = event.srcElement.style.backgroundImage
      .slice(4, -1)
      .replace(/"/g, "");
    const dragData = { type: "image", src: url };
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  // Create the tile with the gathered informations
  function _onDropImage(event: any, data: any) {
    if (data.type == "image") {
      // Projecting screen coords to the canvas
      let t = canvas.tiles.worldTransform;
      Tile.create({
        x: (event.clientX - t.tx) / canvas.stage.scale.x,
        y: (event.clientY - t.ty) / canvas.stage.scale.y,
        height: 250,
        width: 250,
        scale: 1,
        z: 400,
        img: data.src,
        hidden: false,
        locked: false,
        rotation: 0,
      }).then((data: any) => {
        let tile = canvas.tiles.placeables.filter((a) => a.id === data._id)[0];
        // Update the tile width to have correct the aspect ratio
        // TODO: May throw an error when the db is not yet updated, did not found any workaround
        tile.update({ width: tile.height * tile.aspectRatio });
      });
    }
  }

  // Add the listener to the board html element
  Hooks.once("canvasReady", (_: any) => {
    document.getElementById("board").addEventListener("drop", (event) => {
      // Try to extract the data (type + src)
      let data: any;
      try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch (err) {
        return;
      }
      // Create the tile
      _onDropImage(event, data);
    });
  });

  // Add the listener for draggable event from the journal image
  Hooks.on("renderJournalSheet", (sheet: any, html: any, data: any) => {
    html.find(".lightbox-image").each((i: number, div: Element) => {
      div.setAttribute("draggable", "true");
      div.addEventListener("dragstart", _onDragStart, false);
    });
  });
};
