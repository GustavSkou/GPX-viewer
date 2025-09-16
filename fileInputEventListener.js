document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const routeDisplayElement = getRouteDisplayTemplate();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileReader = event.target;
        const route = fileToRoute(fileReader.result, file.name);
        setInfoElements(route, routeDisplayElement);
        addRouteDisplayElementToList(routeDisplayElement);

        var map = MapHandler.instance.createMap(`map${MapHandler.instance.maps.length}`);
        const polygon = MapHandler.instance.drawRoute(route, map);
        MapHandler.instance.setViewToRoute(polygon, map);
        MapHandler.instance.setStartPoint(route.points[0].latLngs, map);
        MapHandler.instance.setEndPoint(route.points[route.points.length-1].latLngs, map);
      };
      reader.readAsText(file);
    }
  });

function fileToRoute(fileContent, fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const fileExtension = fileName.substring(lastDotIndex);

  switch (fileExtension) {
    case ".gpx":
      return GPXHandler.parseGPXToRoute(fileContent);

    default:
      break;
  }
}

function setInfoElements(route, parent) {
  const nameLi = parent.querySelector("#name_li");
  const iconLi = parent.querySelector("#icon_li");
  const distanceLi = parent.querySelector("#distance_li");
  const elevGainLi = parent.querySelector("#elev_li");
  const speedLi = parent.querySelector("#speed_li");
  const timeLi = parent.querySelector("#time_li");
 
  const nameElement = parent.querySelector("#name");
  const iconElement = parent.querySelector("#icon");
  const distElement = parent.querySelector("#distance");
  const elevGainElement = parent.querySelector("#elev");
  const speedElement = parent.querySelector("#speed");
  const timeElement = parent.querySelector("#time");

  nameElement.textContent = route.name;
  iconElement.src = route.type.iconUrl;
  distElement.textContent = route.distanceString;
  elevGainElement.textContent = route.elevationGainString;
  speedElement.textContent = route.averageSpeedString;
  timeElement.textContent = route.timeString;

  nameLi.style.display = route.name != "" ? "block" : "none";
  iconLi.style.display = "flex";
  distanceLi.style.display = route.distance >= 0 ? "block" : "none";
  elevGainLi.style.display = route.elevationGain >= 0 ? "block" : "none";
  speedLi.style.display = route.averageSpeed > 0 ? "block" : "none";
  timeLi.style.display = route.timeMS > 0 ? "block" : "none";
}

/**
 * returns the distance between two pairs lat/lon points in Km
 * @param {Number} lat1 
 * @param {Number} lon1 
 * @param {Number} lat2 
 * @param {Number} lon2 
 * @returns {Number}
 */
function Distance(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const p = Math.PI / 180;

  const a =
    0.5 -
    Math.cos((lat2 - lat1) * p) / 2 +
    (Math.cos(lat1 * p) *
      Math.cos(lat2 * p) *
      (1 - Math.cos((lon2 - lon1) * p))) /
      2;

  return 2 * r * Math.asin(Math.sqrt(a));
}
/**
 * returns the speed over at distance in Km/h
 * @param {Number} distance 
 * @param {Number} startTimeMS 
 * @param {Number} endTimeMS 
 * @returns {Number}
 */
function Speed(distanceKM, startTimeMS, endTimeMS)
{
  return (distanceKM / (endTimeMS - startTimeMS)) * _HOUR_MS;
}
/**
 * returns the % gradient for a given distance and elevationGained over set distance
 * @param {Number} distance 
 * @param {Number} elevation 
 */
function gradient(distanceKM, elevationGainedM) {
  return elevationGainedM / (distanceKM * 1000) * 100;
}

function getRouteDisplayTemplate() {
  const template = document.getElementById("routeDisplayTemplate");
  const clone = template.content.cloneNode(true);
  clone.querySelector("#tempMapId").id = `map${MapHandler.instance.maps.length}`;
  return clone;
}

function addRouteDisplayElementToList(element) {
  document.getElementById("routeDisplayList").prepend(element); // use routeDisplayList as a stack
}
