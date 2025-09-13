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

function drawRouteSegments(route, map,)
{
  for (let i = 0; i < route.points.latLngs.length-1; i++) {
    var segment = L.polyline(
    [route.points.latLngs[i], route.points.latLngs[i+1]], {
      fillOpacity: 0.0,
      color: "red"
    }
    ).bindTooltip(
      `ele: ${getAvgEle(route.points.elevationPts[i], route.points.elevationPts[i+1])}`

      
    ).addTo(map);
    /*segment.bindTooltip(
      `${(route.points.elevationPts[i] + route.points.elevationPts[i+1])/2}`
    );*/
  }
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
        //segment.bindTooltip((elevationList[i] + elevationList[i+1])/2);
      } catch (error) {
        continue;
      }
    }
  }
  else
    return;
}