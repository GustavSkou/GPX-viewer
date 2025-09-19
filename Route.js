import Segment from './Segment.js';
import Point from './Point.js';
import { RouteType, Ride, Run } from './RouteType.js';

const _HOUR_MS = 60 * 60 * 1000;
const _MINUTE_TO_MS = 60 * 1000;
const _SECOND_TO_MS = 1000;

export class Route {
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
   * @param {Segment[]} segments 
   */
  constructor(
    name = "",
    type = new RouteType(),
    distance = 0,
    elevationGain = 0,
    averageSpeed = -1,
    topSpeed = -1,
    points = new Array(),
    segments = new Array()
  ) {
    this.name = name;
    this.type = type;
    this.distance = distance;
    this.elevationGain = elevationGain;
    this.averageSpeed = averageSpeed;
    this.topSpeed = topSpeed;
    this.points = points;
    this.segments = segments;
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