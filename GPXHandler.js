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
   * 
   * @param {Element} track 
   * @returns {Route}
   */
  static parseTrackToRoute(track) {
    const trackPoints = track.getElementsByTagName("trkpt"); // contains only the trkpt elements
    const points = getPointArray(trackPoints);
    const route = new Route ( 
      GPXHandler.getTrkName(track),
      GPXHandler.getTrkType(track),
      points
    );  
    return route;
  }

  /**
   * Creates a new Point instance and pushes it to the route's point array 
   * @param {Array} latLngs
   * @param {Array} ele  
   */
  static getPointArray(trackPoints) {
    const points = Array();
    for (let i = 0; i < trackPoints.length - 1; i++) {
      const lat = trackPoint.getAttribute("lat");
      const lon = trackPoint.getAttribute("lon");
      const ele = parseFloat(trackPoint.getElementsByTagName("ele")[0].textContent);
      const MS = GPXHandler.getTrkPointTimeMS(trackPoint)

      points.push( new Point (
          [lat, lon], 
          ele, 
          MS
        )
      );      
    }
  }

  /**
   * 
   * @param {Element} trackPoint 
   * @returns {Number}
   */
  static getTrkPointTimeMS(trackPoint) {
    try {
      return new Date(trackPoint.getElementsByTagName("time")[0].textContent).getTime();
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

}