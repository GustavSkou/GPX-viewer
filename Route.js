const _HOUR_MS = 60 * 60 * 1000;
const _MINUTE_TO_MS = 60 * 1000;
const _SECOND_TO_MS = 1000;

class RouteType {
  get iconUrl() {
    return "icons\\route-icon.png";
  }
}
class Ride extends RouteType {
  get iconUrl() {
    return "icons\\ride-icon.png";
  }
}
class Run extends RouteType {
  get iconUrl() {
    return "icons\\run-icon.png"
  }
}
/**
 * Point is a latitude and longitude "point"
 */
class Point
{
  /**
   * @param {string[]} latLngs 
   * @param {Number} elevation 
   * @param {Number} time 
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

/**
 * Segment is the line between two points on a Route
 */
class Segment
{
  /**
   * @param {Number} distance 
   * @param {Number} speed 
   * @param {Number} gradient 
   */
  constructor( 
    distance,
    speed,
    gradient,
  ) {
    this.distance = distance;
    this.speed = speed;
    this.gradient = gradient;
  }

  toString() {
    return `${this.distance}, ${this.speed}, ${this.gradient}`
  }
}

class Route {
  /**
   * 
   * @param {String} name 
   * @param {RouteType} type 
   * @param {Number} distance 
   * @param {Number} elevationGain 
   * @param {Number} timeMS 
   * @param {Number} averageSpeed 
   * @param {Number} topSpeed 
   * @param {Point[]} points 
   * @param {Segment[]} segment 
   */
  constructor(
    name = "",
    type = new RouteType(),
    distance = 0,
    elevationGain = 0,
    averageSpeed = -1,
    topSpeed = -1,
    points = new Array(),
    segment
  ) {
    this.name = name;
    this.type = type;
    this.distance = distance;
    this.elevationGain = elevationGain;
    this.averageSpeed = averageSpeed;
    this.topSpeed = topSpeed;
    this.points = points;
    this.Segment = segment;
  }

  get timeMS() {
    try {
      return this.points[this.points.length - 1].time - this.points[0].time;
    }
    catch(error) {
      return 0;
    }
  }

  get distanceString() {
    return `${parseFloat(this.distance.toFixed(3))} km`;
  }

  get elevationGainString() {
    return `${parseFloat(this.elevationGain.toFixed(0))} m`;
  }

  get averageSpeedString() {
    return `${parseFloat(this.averageSpeed.toFixed(2))} km/t`;
  }

  get timeString() {
    let milliseconds = this.timeMS;
    const hours = milliseconds / _HOUR_MS - ((milliseconds / _HOUR_MS) % 1);
    milliseconds -= hours * _HOUR_MS;
    const minutes = milliseconds / _MINUTE_TO_MS - ((milliseconds / _MINUTE_TO_MS) % 1);
    milliseconds -= minutes * _MINUTE_TO_MS;
    const seconds = milliseconds / _SECOND_TO_MS;

    return new Array(
      hours.toString().padStart(2, "0"),
      minutes.toString().padEnd(2, "0"),
      seconds.toString().padStart(2, "0")
    ).join(":");
  }

  /**
   * updates the route's total elevation gain by comparing the newest elevation and the previous elevation
   */
  updateElevationGain()
  {
    const lastIndex = this.points.length - 1;
    if (this.points.length < 2 ) return
      
    if (this.points[lastIndex].elevation > this.points[lastIndex-1].elevation)
      this.elevationGain += this.points[lastIndex].elevation - this.points[lastIndex-1].elevation;
  }

  /**
   * checks if the time at the first and last index is a valid time 
   * @returns {boolean}
   */
  isTimeValid() {
    try {
      return this.points[0].time > -1 && this.points[this.points.length-1].time > -1;
    } catch (error) {
      return false;
    }
  }

  toString() {
    return `${this.distanceString} ${this.elevationGainString} ${this.averageSpeedString} ${this.timeString}`
  }
}