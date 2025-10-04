/**
 * Point is a latitude and longitude "point"
 */
class Point
{
  /**
   * @param {string[]} latLngs 
   * @param {Number} elevation 
   * @param {Number} time       //time in MS
   * @param {Number} heartRate // BPM
   */
  constructor( 
    latLngs = new Array(String),
    elevation = -1,
    time = -1,
    heartRate = -1
  ) {
    this.latLngs = latLngs;
    this.elevation = elevation;
    this.time = time;
    this.heartRate = heartRate;
  }
}