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
   * @param {Segment[]} segments 
   * @param {Date} date
   */
  constructor(
    name,
    type = new RouteType(),
    distance,
    elevationGain,
    averageSpeed,
    topSpeed,
    points,
    segments,
    date
  ) {
    this.name = name;
    this.type = type;
    this.distance = distance;
    this.elevationGain = elevationGain;
    this.averageSpeed = averageSpeed;
    this.topSpeed = topSpeed;
    this.points = points;
    this.segments = segments;
    this.date = date;
  }

  constructor (
    name,
    type = new RouteType(),
    points
  ) 
  {
    this.name = name;
    this.type = type;
    this.points = points;

    this.distance;
    this.elevationGain;
    this.averageSpeed;
    this.topSpeed;
    this.segments;
    this.date;

    let accumulatedSpeed = 0;
    for (let i = 0; i < points.length - 1; i++) {
      if (i == 0) continue;

      let distanceBetweenPoints = Distance (
        this.points[i-1].latLngs[0], 
        this.points[i-1].latLngs[1], 
        this.points[i].latLngs[0], 
        this.points[i].latLngs[1] 
      );
      
      this.distance += distanceBetweenPoints;
      this.updateElevationGain();
      
      let speedBetweenPoints = 0;
      // if the time is a valid time, speed can be calculated
      if ( this.isTimeValid() ) {
        speedBetweenPoints = Speed (distanceBetweenPoints, this.points[i-1].time, this.points[i].time);
        this.topSpeed = speedBetweenPoints > this.topSpeed ? speedBetweenPoints : this.topSpeed;
        accumulatedSpeed += speedBetweenPoints;
      }

      this.setRouteSegments(
        distanceBetweenPoints, 
        speedBetweenPoints,
        gradient(distanceBetweenPoints, this.points[i].elevation - this.points[i-1].elevation)
      );
    }
    
    if ( this.isTimeValid() ) {
      this.averageSpeed = accumulatedSpeed / (trackPoints.length - 1);
      this.date = new Date(this.points[0].time);
    }
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

  get dateString() {
    return this.date.toISOString();
  }

  /**
   *
   * @param {Number} distance 
   * @param {Number} speed 
   * @param {Number} gradient 
   */
  setRouteSegments(distance, speed, gradient) {
    this.segments.push ( new Segment (
        distance, 
        speed, 
        gradient
      )
    )
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

  getGpxString() {
    let gpxContent =`<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="mig" xmlns="http://www.topografix.com/GPX/1/1">\n <metadata>\n  <link href="https://gustavskou.github.io/GPX-viewer/"></link>\n  <time>${this.dateString}</time>\n </metadata>\n <trk>\n  <name>${this.name}</name>\n  <trkseg>`;

    gpxContent += this.getTrkptString();
    
    gpxContent +=`\n  </trkseg>\n </trk>\n</gpx>`;
    
    return gpxContent;
  }

  getGpxBlob() {
    const gpxContent = this.getGpxString();
    const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
    return blob;
  }

  getGpxUrl() {
    const blob = this.getGpxBlob();
    const url = URL.createObjectURL(blob);
    return url;
  }

  getTrkptString() {
    let trkpts = "";
    this.points.forEach(point => {
      let latitude = point.latLngs[0];
      let longitude = point.latLngs[1];
      let elevation = point.elevation;

      trkpts +=`\n   <trkpt lat="${latitude}" lon="${longitude}">\n    <ele>${elevation}</ele>\n   </trkpt>`});
    return trkpts;
  }

  toString() {
    return `${this.distanceString} ${this.elevationGainString} ${this.averageSpeedString} ${this.timeString}`
  }
}