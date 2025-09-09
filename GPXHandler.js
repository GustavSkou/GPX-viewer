class GPXHandler {
  constructor() {}

  static getGPXRouteData(track) {
    const trackPoints = track.getElementsByTagName("trkpt"); // contains only the trkpt elements

    const route = new Route( 
      GPXHandler.getTrkName(track),
      GPXHandler.getTrkType(track)
    );

    let totalSpeed = 0;

    let lat1 = 0,
        lon1 = 0,
        ele1 = 0,
        time1 = new Date(),
        lat2 = 0,
        lon2 = 0,
        ele2 = 0,
        time2 = new Date(),
        distanceBetweenPoints = 0;


    for (let i = 0; i < trackPoints.length; i++) {
      GPXHandler.setRoutePts(route, trackPoints[i]);
      
      if (i != 0) {
        lat2 = route.routePts[i][0];
        lon2 = route.routePts[i][1];
        ele2 = route.routeEleList[i];

        distanceBetweenPoints = Distance(lat1, lon1, lat2, lon2); // km
        route.elevationGain += ele2 > ele1 ? ele2 - ele1 : 0; 
        route.distance += distanceBetweenPoints;

        lat1 = lat2;
        lon1 = lon2;
        ele1 = ele2;

        if (GPXHandler.getTrkPointTimeMS(trackPoints, i) == null) 
          continue;
        else {
          time2 = GPXHandler.getTrkPointTimeMS(trackPoints, i);
          let speedBetweenPoints = (distanceBetweenPoints / (time2 - time1)) * 3600000;
          time1 = time2;

          totalSpeed += speedBetweenPoints;
          route.topSpeed = speedBetweenPoints > route.topSpeed ? speedBetweenPoints : route.topSpeed;
        }
      } 
      else {
        lat1 = route.routePts[0][0];
        lon1 = route.routePts[0][1];
        ele1 = route.routeEleList[0];
        if (GPXHandler.getTrkPointTimeMS(trackPoints, i) == null)
          continue;
        time1 = GPXHandler.getTrkPointTimeMS(trackPoints, 0);
      }

      route.averageSpeed = totalSpeed / (trackPoints.length - 1);
    }
    if (GPXHandler.getTrkPointTimeMS(trackPoints, 0) != null && GPXHandler.getTrkPointTimeMS(trackPoints, trackPoints.length-1) != null)
      route.timeMS = GPXHandler.getTrkPointTimeMS(trackPoints, trackPoints.length-1) - GPXHandler.getTrkPointTimeMS(trackPoints, 0);

    console.log(
      `${route.distanceString} 
      ${route.elevationGainString} 
      ${route.averageSpeedString} 
      ${route.timeString}`
    );

    return route;
  }

  static parseGPXToRoute(file) {
    const gpxContent = file;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, "application/xml");
    const track = xmlDoc.getElementsByTagName("trk")[0];
    return GPXHandler.getGPXRouteData(track);
  }

  static getTrkPointTimeMS(trackPoints, index) {
    try {
      return new Date(
        trackPoints[index].getElementsByTagName("time")[0].textContent
      ).getTime();
    } catch (error) {
      return null;
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
      return track.getElementsByTagName("type")[0].textContent;
    } catch (error) {
      return "";
    }
  }

  static setRoutePts(route, trackPoint) {
    const lat = trackPoint.getAttribute("lat");
    const lon = trackPoint.getAttribute("lon");
    const ele = trackPoint.getElementsByTagName("ele")[0].textContent;
    route.routePts.push([lat, lon]);
    route.routeEleList.push(ele)
  }
}