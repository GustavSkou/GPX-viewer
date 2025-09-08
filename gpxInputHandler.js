document
  .getElementById("gpxFileInput")
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
        const polygon = drawRoute(route.routePts, map);
        setViewToRoute(polygon, map);
        setStartPoint(route.routePts, map);
        setEndPoint(route.routePts, map);
      };
      reader.readAsText(file);
    }
  });

function fileToRoute(fileContent, fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const fileExtension = fileName.substring(lastDotIndex);

  switch (fileExtension) {
    case ".gpx":
      return parseGPXToRoute(fileContent);

    default:
      break;
  }
}

function setInfoElements(route, parent) {
  const distanceLi = parent.querySelector("#distance_li");
  const elevGainLi = parent.querySelector("#elev_li");
  const speedLi = parent.querySelector("#speed_li");
  const timeLi = parent.querySelector("#time_li");

  const nameElement = parent.querySelector("#name");
  const distElement = parent.querySelector("#distance");
  const elevGainElement = parent.querySelector("#elev");
  const speedElement = parent.querySelector("#speed");
  const timeElement = parent.querySelector("#time");

  nameElement.textContent = route.name;
  distElement.textContent = route.distanceString;
  elevGainElement.textContent = route.elevationGainString;
  speedElement.textContent = route.averageSpeedString;
  timeElement.textContent = route.timeString;

  distanceLi.style.display = route.distance >= 0 ? "block" : "none";
  elevGainLi.style.display = route.elevationGain >= 0 ? "block" : "none";
  speedLi.style.display = route.averageSpeed > 0 ? "block" : "none";
  timeLi.style.display = route.timeMS > 0 ? "block" : "none";
}

function parseGPXToRoute(file) {
  const gpxContent = file;
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, "application/xml");
  const track = xmlDoc.getElementsByTagName("trk")[0];
  return GetGPXRouteData(track);
}

function GetGPXRouteData(track) {
  const trackPoints = track.getElementsByTagName("trkpt"); // contains only the trkpt elements

  const route = new Route();
  route.name =
    track.getElementsByTagName("name")[0] != null
      ? track.getElementsByTagName("name")[0].textContent
      : "";
  route.type =
    track.getElementsByTagName("type")[0] != null
      ? track.getElementsByTagName("type")[0].textContent
      : "";

  let totalSpeed = 0;

  for (let i = 0; i < trackPoints.length; i++) {
    if (i == 0) {
      // setup first track points
      lat1 = trackPoints[0].getAttribute("lat");
      lon1 = trackPoints[0].getAttribute("lon");
      ele1 = trackPoints[0].getElementsByTagName("ele")[0].textContent;

      if (trackPoints[i].getElementsByTagName("time")[0] != null)
        time1 = new Date(
          trackPoints[0].getElementsByTagName("time")[0].textContent
        );
    } else {
      let lat2 = trackPoints[i].getAttribute("lat");
      let lon2 = trackPoints[i].getAttribute("lon");
      let ele2 = trackPoints[i].getElementsByTagName("ele")[0].textContent;

      let distanceBetweenPoints = Distance(lat1, lon1, lat2, lon2); // km

      if (trackPoints[i].getElementsByTagName("time")[0] != null) {
        let time2 = new Date(
          trackPoints[i].getElementsByTagName("time")[0].textContent
        );
        let speedBetweenPoints =
          (distanceBetweenPoints / (time2.getTime() - time1.getTime())) *
          3600000;
        totalSpeed += speedBetweenPoints;
        route.topSpeed =
          speedBetweenPoints > route.topSpeed
            ? speedBetweenPoints
            : route.topSpeed;
        time1 = time2;
      }

      route.elevationGain += ele2 > ele1 ? ele2 - ele1 : 0; // if the elevationGain between two pts is positive we add it to the routes total elevationGain
      route.distance += distanceBetweenPoints;

      lat1 = lat2;
      lon1 = lon2;
      ele1 = ele2;
    }
    route.routePts.push([lat1, lon1]);
  }

  route.averageSpeed = totalSpeed / trackPoints.length - 1;

  if (
    trackPoints[0].getElementsByTagName("time")[0] != null ||
    trackPoints[trackPoints.length - 1].getElementsByTagName("time")[0] != null
  )
    route.timeMS =
      new Date(
        trackPoints[trackPoints.length - 1].getElementsByTagName(
          "time"
        )[0].textContent
      ).getTime() -
      new Date(
        trackPoints[0].getElementsByTagName("time")[0].textContent
      ).getTime();

  console.log(
    route.distanceString +
      " " +
      route.elevationGainString +
      " " +
      route.averageSpeedString +
      " " +
      route.timeString
  );

  return route;
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
