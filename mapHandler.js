
/**
 * Facade for using Leftlet with the Route
 */
class MapHandler {
  constructor() {
    if (MapHandler._instance) {
      return MapHandler._instance;
    }
    MapHandler._instance = this;

    this.maps = new Map();  
  }

  static get instance() {
    if (!MapHandler._instance) {
      MapHandler._instance = new MapHandler();
    }
    return MapHandler._instance;
  }

  /**
   * Create Map and bind it to the html element using the elementId
   * @param {String} elementId 
   * @returns {L.Map}
   */
  createMap(elementId) {
    var map = L.map(elementId, { zoomControl: false }).setView([0, 0], 19);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    MapHandler.instance.maps.set(elementId, map); // save the Map to the maps map
    return map;
  }

  /**
   * draws the route onto the map and returns a polygon representing the route
   * @param {Route} route 
   * @param {L.Map} map 
   * @returns {L.Polygon}
   */
  drawRoute(route, map) {
    this.drawRouteSegments(route, map);
    const polygon = this.getRoutePolygon(route, map);
    return polygon;
  }

  /**
   * draws a route on the map by making a polyline between all the points 
   * @param {Route} route 
   * @param {L.Map} map  
   */
  drawRouteSegments(route, map,)
  {
    for (let i = 0; i < route.points.length-1; i++) {
      var segment = L.polyline(
      [route.points[i].latLngs, route.points[i+1].latLngs], {
        opacity: 0.5,
        color: "red",
        weight: 5
      }
      ).addTo(map);

      segment.bindTooltip(
        route.segments[i].toString()
      );
    }
  }

  /**
   * create a polygon from a route
   * @param {Route} route 
   * @param {L.Map} map 
   * @returns 
   */
  getRoutePolygon(route, map) {
    const latLngs = route.points.map(pt => pt.latLngs);
    const polygon = L.polygon(latLngs, { color: 'transparent', weight: 0, pane: 'shadowPane' }).addTo(map);
    return polygon;
  }

  /**
   * Set the map's view and zoom to fit it inside the bounds
   * @param {L.Polygon} polygon 
   * @param {L.Map} map 
   */
  setViewToRoute(polygon, map) {
    map.setView(polygon.getCenter());
    map.fitBounds(polygon.getBounds());
  }

  /**
  * 
  * @param {Number[]} latLon
  * @param {L.Map} map
  */
  setStartPoint(latLon, map) {
    L.circle(latLon, 2, {
      color: "green",
      fillOpacity: 1,
    }).addTo(map);
  }

  /**
  *
  * @param {Number[]} latLon
  * @param {L.Map} map
  */
  setEndPoint(latLon, map) {
    L.circle(latLon, 2, {
      color: "blue",
      fillOpacity: 1,
    }).addTo(map);
  }
}