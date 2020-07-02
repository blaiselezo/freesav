export function fromRange(n) {
  return Array.from(new Array(parseInt(n)).keys());
}

export function getSwadeConeShape(direction, angle, distance) {
  angle = angle || 20;
  const coneType = game.settings.get('core', 'coneTemplateType');

  // For round cones - approximate the shape with a ray every 3 degrees
  let angles;
  if (coneType === 'round') {
    const da = Math.min(angle, 3);
    angles = fromRange(angle / da)
      .map((a) => angle / -2 + a * da)
      .concat([angle / 2]);
  }

  // For flat cones, direct point-to-point
  else {
    angles = [angle / -2, angle / 2];
    distance /= Math.cos(toRadians(angle / 2));
  }

  // Get the cone shape as a polygon
  const rays = angles.map((a) =>
    Ray.fromAngle(0, 0, direction + toRadians(a), distance + 1),
  );
  const points = rays
    .reduce(
      (arr, r) => {
        return arr.concat([r.B.x, r.B.y]);
      },
      [0, 0],
    )
    .concat([0, 0]);
  return new PIXI.Polygon(points);
}
