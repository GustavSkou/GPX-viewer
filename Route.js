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

class RoutePoints
{
  constructor( 
    latLngs = [],
    elevationPts = [],
    speedPts = [],
    timePts = []
  ) {
    this.latLngs = latLngs;
    this.elevationPts = elevationPts;
    this.speedPts = speedPts;
    this.timePts = timePts;
  }
  pushRoutePoints(lat, lon, ele = 0, timeMS = 0)
  {
    //if (lat == null|| lon == null)
    this.latLngs.push([lat, lon]);
    this.elevationPts.push(ele);

    if (timeMS != null)
      this.timePts.push(timeMS)
  }
}

class Route {
  constructor(
    name = "",
    type = new RouteType(),
    distance = 0,
    elevationGain = 0,
    timeMS = 0,
    averageSpeed = 0,
    topSpeed = 0,
    points = new RoutePoints()
  ) {
    this.name = name;
    this.type = type;
    this.distance = distance;
    this.elevationGain = elevationGain;
    this.timeMS = timeMS;
    this.averageSpeed = averageSpeed;
    this.topSpeed = topSpeed;
    this.points = points;
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
}