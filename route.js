import * as geometry from 'spherical-geometry-js';

// segment a line into a list segments which length no longer than maxLen
function segment(line, maxLen) {
  let segments = []
  let fromPos = geometry.convertLatLng(line[0])
  let i = 1

  let lengthToMeet = maxLen
  while (i < line.length) {
    let toPos = geometry.convertLatLng(line[i])
    let heading = geometry.computeHeading(fromPos, toPos)
    let distance = geometry.computeDistanceBetween(fromPos, toPos)
    while (distance > lengthToMeet) {
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

export { segment }