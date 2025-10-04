const _HOUR_MS = 60 * 60 * 1000;
const _MINUTE_TO_MS = 60 * 1000;
const _SECOND_TO_MS = 1000;

class RouteType {
  get iconUrl() {
    return "icons\\route-icon.png";
  }
  toString() {
    return "";
  }
}
class Ride extends RouteType {
  get iconUrl() {
    return "icons\\ride-icon.png";
  }
  toString() {
    return "cycling";
  }
}
class Run extends RouteType {
  get iconUrl() {
    return "icons\\run-icon.png";
  }
  toString() {
    return "running";
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
  constructor (
    name,
    type = new RouteType(),
    points
  ) {
    this.name = name;
    this.type = type;
    this.points = points;

    this.distance = 0;
    this.elevationGain = 0;
    this.averageSpeed = 0;
    this.topSpeed = 0;
    this.segments = new Array();
    this.date = -1;
    this.averageHeartRate = -1;

    let accumulatedSpeed = 0;
    let accumulatedHeartRate = 0;
    let accumulatedHeartRateCount = 0;
    for (let i = 0; i < this.points.length - 1; i++) {
      if (this.points[i].heartRate > -1) {
        accumulatedHeartRate += this.points[i].heartRate
        accumulatedHeartRateCount++;
      }

      if (i == 0) continue;

      let distanceBetweenPoints = Distance (
        this.points[i-1].latLngs[0], 
        this.points[i-1].latLngs[1], 
        this.points[i].latLngs[0], 
        this.points[i].latLngs[1] 
      );
      
      this.distance += distanceBetweenPoints;
      this.updateElevationGain(i);
      
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
      this.averageSpeed = accumulatedSpeed / (this.points.length - 1);
      this.date = new Date(this.points[0].time);
    }

    if (accumulatedHeartRate > 0) {
      this.averageHeartRate = accumulatedHeartRate / accumulatedHeartRateCount;
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
    try {
      return this.date.toISOString();
    } catch (error) {
      return "";
    }
    
  }

  get averageHeartRateString() {
    return `${this.averageHeartRate.toFixed(0)}`
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
  updateElevationGain(index)
  {
    if (this.points[index].elevation > this.points[index-1].elevation)
      this.elevationGain += this.points[index].elevation - this.points[index-1].elevation;
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
    const typeString = this.type.toString() != "" ? `<type>${this.type.toString()}</type>\n  ` : "";
    const creator = "GPX-viewer";
    let gpxContent =`<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="${creator}" xmlns="http://www.topografix.com/GPX/1/1">\n <metadata>\n  <link href="https://gustavskou.github.io/GPX-viewer/"></link>\n  <time>${this.dateString}</time>\n </metadata>\n <trk>\n  <name>${this.name}</name>\n  ${typeString}<trkseg>`;

    gpxContent += this.getTrkptString();
    gpxContent +=`\n  </trkseg>\n </trk>\n</gpx>`;
    
    return gpxContent;
  }

  getTrkptString() {
    let trkpts = "";
    this.points.forEach(point => {
      let latitude = point.latLngs[0];
      let longitude = point.latLngs[1];
      let elevation = point.elevation;
      let dateTimeString = "";
      let heartRateString = "";

      if (point.time > -1) {
        let dateTime = new Date(point.time);
        dateTimeString = ` <time>${dateTime.toISOString()}</time>\n   `;
      }

      if (point.heartRate > -1) {
        heartRateString = ` <extensions>\n     <gpxtpx:TrackPointExtension>\n      <gpxtpx:hr>${point.heartRate}</gpxtpx:hr>\n     </gpxtpx:TrackPointExtension>\n    </extensions>\n   `
      }

      trkpts +=`\n   <trkpt lat="${latitude}" lon="${longitude}">\n    <ele>${elevation}</ele>\n   ${dateTimeString}${heartRateString}</trkpt>`});
    return trkpts;
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

  

  toString() {
    return `${this.distanceString} ${this.elevationGainString} ${this.averageSpeedString} ${this.timeString}`
  }
}