const _HOUR_MS = 60*60*1000;
const _MINUTE_TO_MS = 60*1000;
const _SECOND_TO_MS = 1000;

document.getElementById('gpxFile').addEventListener('change', function(event) {
    var map = createMap();
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const track = parseGPX(e)
            const route = GetGPXRouteData(track);
            console.log(route.distance + " " + route.elevation + " " + route.averageSpeed + " " + route.time);
            drawRoute(route.routePts, map);
        };
        reader.readAsText(file);
    }
});

function parseGPX(fileReader)
{
    const gpxContent = fileReader.target.result;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, "application/xml");
    return track = xmlDoc.getElementsByTagName('trk')[0];
}

function GetGPXRouteData(track)
{
    const trackPoints = track.getElementsByTagName('trkpt'); // contains only the trkpt elements

    const route = 
    {
        name: track.getElementsByTagName('name')[0].textContent,
        type: track.getElementsByTagName('type')[0].textContent, 
        distance:0, 
        elevation:0, 
        time:"", 
        averageSpeed:0, 
        topSpeed:0,
        routePts:new Array()
    }

    let totalSpeed = 0;

    for (let i = 0; i < trackPoints.length; i++)
    {
        if (i == 0)
        {
            lat1 = trackPoints[0].getAttribute('lat');
            lon1 = trackPoints[0].getAttribute('lon');
            ele1 = trackPoints[0].getElementsByTagName('ele')[0].textContent;
            time1 = new Date(trackPoints[0].getElementsByTagName('time')[0].textContent);
        }
        else
        {
            let lat2 = trackPoints[i].getAttribute('lat');
            let lon2 = trackPoints[i].getAttribute('lon');
            let ele2 = trackPoints[i].getElementsByTagName('ele')[0].textContent;
            let time2 = new Date(trackPoints[i].getElementsByTagName('time')[0].textContent);

            let distanceBetweenPoints = Distance(lat1, lon1, lat2, lon2); // km
            let speedBetweenPoints = distanceBetweenPoints / (time2.getTime()-time1.getTime()) * 3600000
            route.elevation += ele2 > ele1 ? ele2 - ele1 : 0; // if the elevation between two pts is positive we add it to the routes total elevation

            totalSpeed += speedBetweenPoints;
            route.distance += distanceBetweenPoints;
            route.topSpeed = speedBetweenPoints > route.topSpeed ? speedBetweenPoints : route.topSpeed;

            lat1 = lat2;
            lon1 = lon2;
            ele1 = ele2;
            time1 = time2;
        }
        route.routePts.push( [lat1, lon1] );
    }    
    route.averageSpeed = totalSpeed / trackPoints.length - 1;
    route.time = formatDuration ( 
        new Date(trackPoints[trackPoints.length - 1].getElementsByTagName('time')[0].textContent).getTime() 
        -new Date(trackPoints[0].getElementsByTagName('time')[0].textContent).getTime() );
    return route;
}

function Distance(lat1, lon1, lat2, lon2) { // returns distance between two points in km
    const r = 6371; // km
    const p = Math.PI / 180;
  
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
                  + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
                    (1 - Math.cos((lon2 - lon1) * p)) / 2;
  
    return 2 * r * Math.asin(Math.sqrt(a));
}

function formatDuration( milliseconds )
{
    const hours = milliseconds / _HOUR_MS - milliseconds / _HOUR_MS % 1;
    milliseconds -= hours * _HOUR_MS;
    const minutes = milliseconds / _MINUTE_TO_MS - milliseconds / _MINUTE_TO_MS % 1;
    milliseconds -= minutes*_MINUTE_TO_MS;
    const seconds = milliseconds / _SECOND_TO_MS;

    return new Array (
        hours.toString().padStart(2, "0"), 
        minutes.toString().padEnd(2, "0"),
        seconds.toString().padStart(2, "0")
    ).join(":");
}

function drawRoute( latLonArray, map )
{
    var polygon = L.polygon( latLonArray, {
        fillOpacity: 0.0,
        color: "red"
    } ).addTo(map);
    setViewToRoute(polygon, map);
    setStartPoint( latLonArray, map );
    setEndPoint( latLonArray, map );
}

function setViewToRoute ( polygon, map )
{
    map.setView(polygon.getCenter());
    map.fitBounds(polygon.getBounds());
}

function setStartPoint( latLonArray, map )
{
    L.circle(latLonArray[0], 2, {
        color: "green",
        fillOpacity: 1

    } ).addTo(map);
}

function setEndPoint( latLonArray, map )
{
    L.circle(latLonArray[latLonArray.length - 1], 2, {
        color: "blue",
        fillOpacity: 1
    } ).addTo(map);
}