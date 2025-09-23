const PERSPECTIVE_MIN_Y = 150; // Furthest point (smallest scale) - top of screen
const PERSPECTIVE_MAX_Y = 400; // Closest point (largest scale) - bottom of screen
const PERSPECTIVE_MIN_SCALE = 0.2; // Minimum scale factor (far away)
const PERSPECTIVE_MAX_SCALE = 1.3; // Maximum scale factor (close up)

function getPerspectiveScale(y) {
  // Clamp Y between min and max
  let clampedY = constrain(y, PERSPECTIVE_MIN_Y, PERSPECTIVE_MAX_Y);

  // Map Y to scale factor (higher Y = larger scale, lower Y = smaller scale)
  let scale = map(
    clampedY,
    PERSPECTIVE_MIN_Y,
    PERSPECTIVE_MAX_Y,
    PERSPECTIVE_MIN_SCALE,
    PERSPECTIVE_MAX_SCALE
  );

  return scale;
}
