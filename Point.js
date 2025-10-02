/**
 * Point is a latitude and longitude "point"
 */
class Point
{
  /**
   * @param {string[]} latLngs 
   * @param {Number} elevation 
   * @param {Number} time       //time in MS
   */
  constructor( 
    latLngs = new Array(String),
    elevation,
    time = -1,
  ) {
    this.latLngs = latLngs;
    this.elevation = elevation;
    this.time = time;
  }
}