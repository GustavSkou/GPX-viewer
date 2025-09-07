class Route {
    constructor(name = "", type = "", distance = 0, elevationGain = 0, time = "", averageSpeed = 0, topSpeed = 0, routePts = []) {
        this.name = name;
        this.type = type;
        this.distance = distance;
        this.elevationGain = elevationGain;
        this.time = time;
        this.averageSpeed = averageSpeed;
        this.topSpeed = topSpeed;
        this.routePts = routePts;
    }

    get distanceString() {
        return `${parseFloat(this.distance.toFixed(3))} km`;
    }

    get elevationGainString() {
        return `${parseFloat(this.elevationGain.toFixed(0))} m`;
    }

    get averageSpeedString() {
        return `${parseFloat(this.averageSpeed.toFixed(2))} km/t`;
    }
}