Window.maps = new Array();

function createMap(divElementId) {
  var map = L.map(divElementId).setView([0, 0], 19);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  Window.maps.push(map);
  return map;
}

function drawRoute(latLonArray, map) {
  var polyline = L.polyline(latLonArray, {
    fillOpacity: 0.0,
    color: "red",
  }).addTo(map);
  return polyline;
}

function setViewToRoute(polygon, map) {
  map.setView(polygon.getCenter());
  map.fitBounds(polygon.getBounds());
}

function setStartPoint(latLonArray, map) {
  L.circle(latLonArray[0], 2, {
    color: "green",
    fillOpacity: 1,
  }).addTo(map);
}

function setEndPoint(latLonArray, map) {
  L.circle(latLonArray[latLonArray.length - 1], 2, {
    color: "blue",
    fillOpacity: 1,
  }).addTo(map);
}
