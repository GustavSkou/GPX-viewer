document.getElementById('gpxFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const gpxContent = e.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(gpxContent, "application/xml");
            const track = xmlDoc.getElementsByTagName('trk')[0];

            route = GetGPXRouteData(track);
            console.log(route.distance + " " + route.elevation + " " + route.averageSpeed + " " + route.time);
        };
        reader.readAsText(file);
    }
});

function GetGPXRouteData(track)
{
    const trackPoints = track.getElementsByTagName('trkpt'); // contains only the trkpt elements

    const route = 
    {
        name: track.getElementsByTagName('name')[0].textContent,
        type: track.getElementsByTagName('type')[0].textContent, 
        distance:0, 
        elevation:0, 
        time:0, 
        averageSpeed:0, 
        topSpeed:0
    }

    let lat1 = trackPoints[0].getAttribute('lat');
    let lon1 = trackPoints[0].getAttribute('lon');
    let ele1 = trackPoints[0].getElementsByTagName('ele')[0].textContent;
    let time1 = new Date(trackPoints[0].getElementsByTagName('time')[0].textContent);


    let lat2 = 0;
    let lon2 = 0;
    let ele2 = 0;
    let time2 = new Date();

    let totalSpeed = 0;

    for (let i = 1; i < trackPoints.length; i++)
    {
        lat2 = trackPoints[i].getAttribute('lat');
        lon2 = trackPoints[i].getAttribute('lon');
        ele2 = trackPoints[i].getElementsByTagName('ele')[0].textContent;
        time2 = new Date(trackPoints[i].getElementsByTagName('time')[0].textContent);

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
    route.averageSpeed = totalSpeed / trackPoints.length - 1;
    route.time = ( new Date(trackPoints[trackPoints.length - 1].getElementsByTagName('time')[0].textContent) - new Date(trackPoints[0].getElementsByTagName('time')[0].textContent) ) / 1000 /60 /60;
    return route;
}

function Distance(lat1, lon1, lat2, lon2) { // returns distance in km
    const r = 6371; // km
    const p = Math.PI / 180;
  
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2
                  + Math.cos(lat1 * p) * Math.cos(lat2 * p) *
                    (1 - Math.cos((lon2 - lon1) * p)) / 2;
  
    return 2 * r * Math.asin(Math.sqrt(a));
}