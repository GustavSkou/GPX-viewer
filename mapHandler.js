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

function drawRoute(route = new Route(), map) {
  drawRouteSegments(route, map);
  const latLngs = route.points.map(pt => pt.latLngs);
  const polygon = L.polygon(latLngs, { color: 'transparent', fillOpacity: 0.0, pane: 'shadowPane' }).addTo(map);
  return polygon;
}

function setViewToRoute(polygon, map) {
  map.setView(polygon.getCenter());
  map.fitBounds(polygon.getBounds());
}

function setStartPoint(latLonArray, map) {
  L.circle(latLonArray, 2, {
    color: "green",
    fillOpacity: 1,
  }).addTo(map);
}

function setEndPoint(latLonArray, map) {
  L.circle(latLonArray, 2, {
    color: "blue",
    fillOpacity: 1,
  }).addTo(map);
}

function drawRouteSegments(route, map,)
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
      `ele: ${getAvgEle(route.points[i].elevation, route.points[i + 1].elevation)}`,
      { permanent: false, direction: "top" }
    );

    segments.push(segment);
  }
  return segments;
}
function getAvgEle(ele1, ele2)
{
  let avgEle = (parseFloat(ele1)+parseFloat(ele2))/2;
  return `${avgEle.toFixed(1)}`;
}
function bindElevationPopup(polyline, elevationList = [], map)
{
  if (elevationList.length > 0)
  {
    const LatLngs = polyline.getLatLngs();
    for (let i = 0; i < LatLngs.length-1; i++) {
      try {
        var segment = L.polyline(
          LatLngs[i], LatLngs[i+1], {
            fillOpacity: 0.0,
            color: "red"
          }).addTo(map);
       
      } catch (error) {
        continue;
      }
    }
  }
  else
    return;
}