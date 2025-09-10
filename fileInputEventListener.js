document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    //if (Window.maps[0] != null) Window.maps[0].remove();
    const routeDisplayElement = getRouteDisplayTemplate();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileReader = event.target;
        const route = fileToRoute(fileReader.result, file.name);
        setInfoElements(route, routeDisplayElement);
        addRouteDisplayElementToList(routeDisplayElement);
        var map = createMap(`map${Window.maps.length}`);
        const polygon = drawRoute(route.points.latLngs, map, route.points.elevationPts);
        setViewToRoute(polygon, map);
        setStartPoint(route.points.latLngs, map);
        setEndPoint(route.points.latLngs, map);
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

function setIconElement(type) {

}

function Distance(lat1, lon1, lat2, lon2) {
  // returns distance between two points in km
  const r = 6371; // km
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

function getRouteDisplayTemplate() {
  const template = document.getElementById("routeDisplayTemplate");
  const clone = template.content.cloneNode(true);
  clone.querySelector("#tempMapId").id = `map${Window.maps.length}`;
  return clone;
}

function addRouteDisplayElementToList(element) {
  document.getElementById("routeDisplayList").appendChild(element);
}
