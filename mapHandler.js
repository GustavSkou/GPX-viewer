class MapHandler {
  constructor() {
    if (MapHandler._instance) {
      return MapHandler._instance;
    }
    MapHandler._instance = this;

    this.maps = new Array();  
  }

  static get instance() {
    if (!MapHandler._instance) {
      MapHandler._instance = new MapHandler();
    }
    return MapHandler._instance;
  }

  createMap(divElementId) {
    var map = L.map(divElementId).setView([0, 0], 19);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    this.maps.push(map);
    return map;
  }

  setViewToRoute(polygon, map) {
    map.setView(polygon.getCenter());
    map.fitBounds(polygon.getBounds());
  }

  drawRoute(route = new Route(), map) {
    this.drawRouteSegments(route, map);
    const latLngs = route.points.map(pt => pt.latLngs);
    const polygon = L.polygon(latLngs, { color: 'transparent', fillOpacity: 0.0, pane: 'shadowPane' }).addTo(map);
    return polygon;
  }

  setStartPoint(latLonArray, map) {
    L.circle(latLonArray, 2, {
      color: "green",
      fillOpacity: 1,
    }).addTo(map);
  }

  setEndPoint(latLonArray, map) {
    L.circle(latLonArray, 2, {
      color: "blue",
      fillOpacity: 1,
    }).addTo(map);
  }

  /**
   * 
   * @param {Route} route 
   * @param {*} map 
   * @returns 
   */
  drawRouteSegments(route, map,)
  {
    const segments = [];
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

      segments.push(segment);
    }
    return segments;
  }
}