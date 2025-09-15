class GPXHandler {
  constructor() {}

  /**
   * parses the fileContents and returns a new Route instance
   * @param {string} fileContent 
   * @returns {Route}
   */
    static parseGPXToRoute(fileContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fileContent, "application/xml");
    const track = xmlDoc.getElementsByTagName("trk")[0];
    return GPXHandler.parseTrackToRoute(track);
  }

  /**
   * Create a new instance of Route and sets attributes based on the <trk> element passed
   * @param {Element} track 
   * @returns {Route}
   */
  static parseTrackToRoute(track) {
    let accumulatedSpeed = 0;
    const trackPoints = track.getElementsByTagName("trkpt"); // contains only the trkpt elements
    const route = new Route ( 
      GPXHandler.getTrkName(track),
      GPXHandler.getTrkType(track)
    );

    for (let i = 0; i < trackPoints.length - 1; i++) {
      GPXHandler.setRoutePts(route, trackPoints[i]);
      if (i == 0) continue;

      let distanceBetweenPoints = Distance (
        route.points[i-1].latLngs[0], 
        route.points[i-1].latLngs[1], 
        route.points[i].latLngs[0], 
        route.points[i].latLngs[1] 
      );
      
      route.distance += distanceBetweenPoints;
      route.updateElevationGain();
      
      if ( route.isTimeValid() ) {
        let speedBetweenPoints = Speed (
          distanceBetweenPoints, 
          route.points[i-1].time, 
          route.points[i].time
        );
        route.topSpeed = speedBetweenPoints > route.topSpeed ? speedBetweenPoints : route.topSpeed;
        accumulatedSpeed += speedBetweenPoints;
      }
    }
    
    if ( route.isTimeValid() ) {
      route.averageSpeed = accumulatedSpeed / (trackPoints.length - 1);
    }
    //console.log(route.toString());
    return route;
  }

  /**
   * 
   * @param {Element} trackPoint 
   * @returns {Number}
   */
  static getTrkPointTimeMS(trackPoint) {
    try {
      return new Date(
        trackPoint.getElementsByTagName("time")[0].textContent)
        .getTime();
    } catch (error) {
      return -1;
    }
  }

  /**
   * 
   * @param {Element} track 
   * @returns {string}
   */
  static getTrkName(track) {
    try {
      return track.getElementsByTagName("name")[0].textContent;
    } catch (error) {
      return "";
    }
  }

  /**
   * 
   * @param {Element} track 
   * @returns {RouteType}
   */
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

  /**
   * Creates a new Point instance and pushes it to the route's point array
   * @param {Route} route 
   * @param {Element} trackPoint 
   */
  static setRoutePts(route, trackPoint) {
    const lat = trackPoint.getAttribute("lat");
    const lon = trackPoint.getAttribute("lon");
    const ele = parseFloat(trackPoint.getElementsByTagName("ele")[0].textContent);
    const MS = GPXHandler.getTrkPointTimeMS(trackPoint)
    route.points.push(
      new Point(
        [lat, lon], 
        ele, 
        MS
      ));
  }
}