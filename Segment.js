/**
 * Segment is the line between two points on a Route
 */
class Segment {
  /**
   * @param {Number} distance
   * @param {Number} speed
   * @param {Number} gradient
   */
  constructor(
    distance = 0,
    speed = 0,
    gradient = 0
  ) {
    this.distance = distance;
    this.speed = speed;
    this.gradient = gradient;
  }

  toString() {
    try {
      return `Dist: ${(this.distance * 1000).toFixed(2)}, Speed: ${this.speed.toFixed(2)}, grad: ${this.gradient.toFixed(1)}`;
    } catch (error) {
      return "";
    }
  }
}