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
    segments.push({ fromPos, heading, distance, toPos })
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

function buildRoundTripSegments(coordinates, roadWidth, keepTo) {
  const turningAngle = keepTo === "Right" ? -90 : 90
  let segments = segment(coordinates)

  let seg1, seg2;
  for (let curIdx = segments.length - 1; curIdx >= -1; curIdx--) {
    if (curIdx == segments.length - 1) seg1 = { // first turnover
      fromPos: segments[curIdx].toPos,
      toPos: geometry.computeOffset(segments[curIdx].toPos, roadWidth, segments[curIdx].heading + turningAngle),
      heading: segments[curIdx].heading + turningAngle,
      distance: roadWidth,
    }
    if (curIdx >= 0) seg2 = {
      fromPos: geometry.computeOffset(segments[curIdx].toPos, roadWidth, segments[curIdx].heading + turningAngle),
      toPos: geometry.computeOffset(segments[curIdx].fromPos, roadWidth, segments[curIdx].heading + turningAngle),
      heading: segments[curIdx].heading - 180,
      distance: segments[curIdx].distance,
    }
    else seg2 = { // last turnover
      fromPos: seg1.toPos, toPos: segments[0].fromPos,
      heading: segments[0].heading + 90,
      distance: roadWidth,
    }

    const intPos = intersectionPos(seg1, seg2)
    if (intPos) {
      segments.push({
        fromPos: seg1.fromPos, toPos: intPos, heading: seg1.heading,
        distance: geometry.computeDistanceBetween(seg1.fromPos, intPos)
      })

      seg1 = {
        fromPos: intPos, toPos: seg2.toPos, heading: seg2.heading,
        distance: geometry.computeDistanceBetween(intPos, seg2.toPos)
      }
    } else { // no intersection position
      segments.push(seg1)
      segments.push({
        fromPos: seg1.toPos, toPos: seg2.fromPos,
        heading: geometry.computeHeading(seg1.toPos, seg2.fromPos),
        distance: geometry.computeDistanceBetween(seg1.toPos, seg2.fromPos)
      })
      seg1 = { ...seg2 }
    }
    if (curIdx === -1) {
      segments.push(seg1)
    }
  }

  return segments
}

// based on http://paulbourke.net/geometry/pointlineplane/javascript.txt
function intersectionPos(seg1, seg2) {
  if (seg1.toPos === seg2.fromPos) return seg1.toPos

  const x1 = seg1.fromPos.lng(), x2 = seg1.toPos.lng()
  const x3 = seg2.fromPos.lng(), x4 = seg2.toPos.lng()
  const y1 = seg1.fromPos.lat(), y2 = seg1.toPos.lat()
  const y3 = seg2.fromPos.lat(), y4 = seg2.toPos.lat()

  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false
  }

  const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
  if (denominator === 0) {
    return false
  }

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false
  }

  // Return a object with the x and y coordinates of the intersection
  const x = x1 + ua * (x2 - x1)
  const y = y1 + ua * (y2 - y1)

  return geometry.convertLatLng({ x, y })
}

function route2segments(route) {
  if (!route.type) route.type = "RoundTripLoop"
  if (!route.roadWidth) route.roadWidth = 20
  if (!route.keepTo) route.keepTo = "Right"

  let coords = deduplicateCoordinates(route.coordinates)
  if (route.type === "RoundTripLoop")
    route["segments"] = buildRoundTripSegments(coords, route.roadWidth, route.keepTo)
  else if (route.type === "OneWayLoop") {
    coords.push(coords[0])
    route["segments"] = segment(coords)
  }
  else {
    log.error(`Invalid type "${route.type}" of route "${route.id}"`)
    process.exit(1)
  }
}

export { route2segments }