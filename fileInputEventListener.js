import { FileError } from "./fileError";
import { Route } from "./Route";
import { GPXHandler } from "./GPXHandler";
import { MapHandler } from "./MapHandler"

document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {

    removeFileErrorMessage();

    for (let i = 0; i < event.target.files.length; i++) {
    let file = event.target.files[i];

        if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
          try {
            const fileReader = event.target;
            const route = fileToRoute(fileReader.result, file.name);
            
            if (MapHandler.instance.maps.has(route.name)) // route's "id" shouldn't be the name
              throw new FileError(`${route.name} has already been uploaded`);

            let routeDisplayElement = getRouteDisplayTemplate(route.name);
            setInfoElements(route, routeDisplayElement);
            addRouteDisplayElementToList(routeDisplayElement);

            var map = MapHandler.instance.createMap(`${route.name}`);

            const polygon = MapHandler.instance.drawRoute(route, map);
            MapHandler.instance.setViewToRoute(polygon, map);
            MapHandler.instance.setStartPoint(route.points[0].latLngs, map);
            MapHandler.instance.setEndPoint(route.points[route.points.length-1].latLngs, map);
          }
          catch (error) {
            fileErrorHandler(error);
          }
        };
        reader.readAsText(file);
      }
    }   
  });

/**
 * 
 * @param {String} fileContent 
 * @param {String} fileName 
 * @returns {Route}
 */
function fileToRoute(fileContent, fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const fileExtension = fileName.substring(lastDotIndex);

  switch (fileExtension) {
    case ".gpx":
      return GPXHandler.parseGPXToRoute(fileContent);

    default:
      throw new FileError(`Format ${fileExtension} is not supported`);
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
 * route name is used to link the map's id to the display div's id
 * @param {String} route 
 * @returns {HTMLElement}
 */
function getRouteDisplayTemplate(routeId) {
  const template = document.getElementById("routeDisplayTemplate");
  const clone = template.content.cloneNode(true);
  clone.querySelector("#tempMapId").id = `${routeId}`;
  return clone;
}

function addRouteDisplayElementToList(element) {
  document.getElementById("routeDisplayList").prepend(element); // use routeDisplayList as a stack
}

/**
 * 
 * @param {FileError} error 
 */
function fileErrorHandler(fileError) {
  console.log(fileError.message);
  const error_p = document.getElementById("error_p");

  if (fileError instanceof FileError) {
    error_p.innerHTML += `${fileError.message}<br>`;
  } else {
    error_p.innerHTML += `there was an unexpected error<br>`;
  }
}

function removeFileErrorMessage() {
  const error_p = document.getElementById("error_p");
  error_p.innerHTML = "";
}