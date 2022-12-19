import * as geometry from 'spherical-geometry-js';

// segment a line into a list segments which length no longer than maxLen
function segment(coordinates, maxLen) {
  let segments = []
  let fromPos = geometry.convertLatLng(coordinates[0])
  let i = 1

  let lengthToMeet = maxLen
  while (i < coordinates.length) {
    let toPos = geometry.convertLatLng(coordinates[i])
    let heading = geometry.computeHeading(fromPos, toPos)
    let distance = geometry.computeDistanceBetween(fromPos, toPos)
    while (maxLen > 0 && distance > lengthToMeet) {
      segments.push({ position: fromPos, heading: heading, distance: lengthToMeet })
      let middlePos = geometry.computeOffset(fromPos, lengthToMeet, heading)
      fromPos = middlePos
      distance = geometry.computeDistanceBetween(fromPos, toPos)
      lengthToMeet = maxLen
    }
    // distance <= lengthToMeet
    segments.push({ position: fromPos, heading: heading, distance: distance })
    fromPos = toPos
    lengthToMeet = lengthToMeet - distance
    i++
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

export { segment, deduplicateCoordinates, oneWay2RoundTrip }