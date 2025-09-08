document
  .getElementById("gpxFileInput")
  .addEventListener("change", function (event) {
    if (window.maps[0] != null) window.maps[0].remove();

    document.getElementById("routeDisplay").style.display = "block";
    var map = createMap();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileReader = event.target;
        const route = fileToRoute(fileReader.result, file.name);
        const polygon = drawRoute(route.routePts, map);
        setViewToRoute(polygon, map);
        setStartPoint(route.routePts, map);
        setEndPoint(route.routePts, map);
        setInfoElements(route);
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

function setInfoElements(route) {
  const nameElement = document.getElementById("name");
  const distElement = document.getElementById("distance");
  const elevGainElement = document.getElementById("elev");
  const speedElement = document.getElementById("speed");
  const timeElement = document.getElementById("time");

  const distanceLi = document.getElementById("distance_li");
  const elevGainLi = document.getElementById("elev_li");
  const speedLi = document.getElementById("speed_li");
  const timeLi = document.getElementById("time_li");

  nameElement.textContent = route.name;
  distElement.textContent = route.distanceString;
  elevGainElement.textContent = route.elevationGainString;
  speedElement.textContent = route.averageSpeedString;
  timeElement.textContent = route.timeString;

  if (route.distance >= 0) distanceLi.style.display = "block";
  else distanceLi.style.display = "none";

  if (route.elevationGain >= 0) elevGainLi.style.display = "block";
  else elevGainLi.style.display = "none";

  if (route.averageSpeed > 0) speedLi.style.display = "block";
  else speedLi.style.display = "none";

  if (route.timeMS > 0) timeLi.style.display = "block";
  else timeLi.style.display = "none";
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
