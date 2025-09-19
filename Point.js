/**
 * Point is a latitude and longitude "point"
 */
export class Point {
  /**
   * @param {string[]} latLngs
   * @param {Number} elevation
   * @param {Number} time
   */
  constructor(
    latLngs = new Array(String),
    elevation,
    time = -1
  ) {
    this.latLngs = latLngs;
    this.elevation = elevation;
    this.time = time;
  }
}