class GPXHandler {
  constructor() {}

  static getGPXRouteData(track) {
    const trackPoints = track.getElementsByTagName("trkpt"); // contains only the trkpt elements

    const route = new Route ( 
      GPXHandler.getTrkName(track),
      GPXHandler.getTrkType(track)
    );

    let totalSpeed = 0, distanceBetweenPoints = 0;

    for (let i = 0; i < trackPoints.length - 1; i++) {
      GPXHandler.setRoutePts(route, trackPoints[i]);
      
      distanceBetweenPoints = Distance (
        route.points.latLngs[i][0], 
        route.points.latLngs[i][1], 
        route.points.latLngs[i+1][0], 
        route.points.latLngs[i+1][1] 
      ); // km
      route.elevationGain += 
        route.points.elevationPts[i+1] > route.points.elevationPts[i] 
          ? route.points.elevationPts[i+1] - route.points.elevationPts[i] 
          : 0; 
      route.distance += distanceBetweenPoints;

      if (route.points.timePts[i] == 0) 
        continue;
      else {
        let speedBetweenPoints = (distanceBetweenPoints / (route.points.timePts[i+1] - route.points.timePts[i])) * 3600000;

        totalSpeed += speedBetweenPoints;
        route.topSpeed = speedBetweenPoints > route.topSpeed ? speedBetweenPoints : route.topSpeed;
      }
      route.averageSpeed = totalSpeed / (trackPoints.length - 1);
    }
    if (route.points.timePts[0] != 0 && route.points.timePts[trackPoints.length-1] != 0)
      route.timeMS = route.points.timePts[route.points.timePts.length-1] - route.points.timePts[0];

    console.log(`${route.distanceString} ${route.elevationGainString} ${route.averageSpeedString} ${route.timeString}`);
    return route;
  }

  static parseGPXToRoute(file) {
    const gpxContent = file;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, "application/xml");
    const track = xmlDoc.getElementsByTagName("trk")[0];
    return GPXHandler.getGPXRouteData(track);
  }

  static getTrkPointTimeMS(trackPoint) {
    try {
      return new Date(
        trackPoint.getElementsByTagName("time")[0].textContent)
        .getTime();
    } catch (error) {
      return 0;
    }
  }

  static getTrkName(track) {
    try {
      return track.getElementsByTagName("name")[0].textContent;
    } catch (error) {
      return "";
    }
  }

  static getTrkType(track) {
    try {
      const trackName = track.getElementsByTagName("type")[0].textContent;
      switch (trackName) {
        case "cycling":
          return new Ride();
        case "run":
          return new Run();
        default:
          return new RouteType();
      }
    } catch (error) {}
  }

  static setRoutePts(route, trackPoint) {
    const lat = trackPoint.getAttribute("lat");
    const lon = trackPoint.getAttribute("lon");
    const ele = trackPoint.getElementsByTagName("ele")[0].textContent;
    const MS = GPXHandler.getTrkPointTimeMS(trackPoint)
    route.points.pushRoutePoints(lat, lon, ele, MS)
  }
}