import * as geometry from 'spherical-geometry-js';

// segment a line into a list segments with heading and distance
function segment(coordinates) {
  let segments = []
  let fromPos = geometry.convertLatLng(coordinates[0])
  for (let i = 1; i < coordinates.length; i++) {
    let toPos = geometry.convertLatLng(coordinates[i])
    let heading = geometry.computeHeading(fromPos, toPos)
    let distance = geometry.computeDistanceBetween(fromPos, toPos)
    segments.push({ position: fromPos, heading: heading, distance: distance })
    fromPos = toPos
  }
  return segments
}

function deduplicateCoordinates(coordinates) {
  let i = 0, j = 1
  let result = [coordinates[i]]
  while (j < coordinates.length) {
    if ((result[i][0] != coordinates[j][0]) || (result[i][1] != coordinates[j][1])) {
      result.push(coordinates[j])
      i++
    }
    j++
  }
  return result
}

function oneWay2RoundTrip(coordinates) {
  let result = Array.from(coordinates)
  for (let i = coordinates.length - 2; i >= 1; i--) {
    result.push(coordinates[i])
  }
  return result
}

function route2segments(route) {
  let coords = deduplicateCoordinates(route.coordinates)
  coords = oneWay2RoundTrip(coords)
  route["segments"] = segment(coords)
}

export { route2segments }