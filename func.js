/**
 * returns the distance between two pairs lat/lon points in Km
 * @param {Number} lat1
 * @param {Number} lon1
 * @param {Number} lat2
 * @param {Number} lon2
 * @returns {Number}
 */
export function distance(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const p = Math.PI / 180;

  const a = 0.5 -
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
export function speed(distanceKM, startTimeMS, endTimeMS) {
  return (distanceKM / (endTimeMS - startTimeMS)) * _HOUR_MS;
}

/**
 * returns the % gradient for a given distance and elevationGained over set distance
 * @param {Number} distanceKM
 * @param {Number} elevationGainedM
 * @returns {Number}
 */
export function gradient(distanceKM, elevationGainedM) {
  return elevationGainedM / (distanceKM * 1000) * 100;
}
