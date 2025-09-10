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

function drawRoute(latLonArray, map, elevationList = []) {
  var polyline = L.polyline(latLonArray, {
    fillOpacity: 0.0,
    color: "red",
  }).addTo(map);
  bindElevationPopup(polyline, elevationList);
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

function bindElevationPopup(polyline, elevationList = [])
{
  if (elevationList.length > 0)
  {
    const LatLngs = polyline.getLatLngs();
    for (let i = 0; i < LatLngs.length-1; i++) {
      try {
        const segment = L.polyline(LatLngs[i], LatLngs[i+1], {color: "transparent"}).addTo(polyline._map);
        segment.bindTooltip((elevationList[i] + elevationList[i+1])/2);
      } catch (error) {
        continue;
      }
    }
  }
  else
    return;
}