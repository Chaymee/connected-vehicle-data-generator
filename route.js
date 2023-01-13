import log from 'loglevel';
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

function buildRoundTripCoords(coordinates) {
  let result = Array.from(coordinates)
  for (let i = coordinates.length - 2; i >= 0; i--) {
    result.push(coordinates[i])
  }
  return result
}

function route2segments(route) {
  if (!route.type) route.type = "RoundTripLoop"

  let coords = deduplicateCoordinates(route.coordinates)
  if (route.type === "RoundTripLoop")
    coords = buildRoundTripCoords(coords)
  else if (route.type === "OneWayLoop")
    coords.push(coords[0])
  else {
    log.error(`Invalid type "${route.type}" of route "${route.id}"`)
    process.exit(1)
  }
  route["segments"] = segment(coords)
}

export { route2segments }