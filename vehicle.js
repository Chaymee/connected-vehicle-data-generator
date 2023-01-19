import log from 'loglevel';
import * as geometry from 'spherical-geometry-js';
import rangeParser from "parse-numeric-range";
import { vehicleController } from "./controller.js"


function calculateNexPos(forward, segments, curtIdx, curtPos, distance) {
  while (distance > 0) {
    const curtSeg = segments[curtIdx]
    const segRemainingDistance = geometry.computeDistanceBetween(curtSeg[forward ? 'toPos' : 'fromPos'], curtPos)
    if (distance < segRemainingDistance) {
      curtPos = geometry.computeOffset(curtPos, distance, curtSeg.heading + (forward ? 0 : 180))
      break
    } else {
      curtPos = segments[curtIdx][forward ? 'toPos' : 'fromPos']
      curtIdx = forward ? (curtIdx < (segments.length - 1) ? curtIdx + 1 : 0) : (curtIdx == 0 ? segments.length - 1 : curtIdx - 1)
      distance -= segRemainingDistance
    }
  }
  return { curtIdx, curtPos }
}

function getForwardPos(segments, curtIdx, curtPos, distance) {
  return calculateNexPos(true, segments, curtIdx, curtPos, distance)
}

function getBackwardPos(segments, curtIdx, curtPos, distance) {
  return calculateNexPos(false, segments, curtIdx, curtPos, distance)
}

class Vehicle {
  constructor(id, segments, ...options) {
    Object.assign(this, ...options)
    this.idStr = id.toString()
    this.vehID = this.IDPrefix + this.idStr.padStart(4, "0")
    this.segments = segments
    this.curtIdx = getRandomInt(this.segments.length)
    this.lastTs = 0
    this.curtPos = this.segments[this.curtIdx].fromPos
    if (!("status" in this)) this.status = "OK"

    if (!("additionalPayload" in this)) this.additionalPayload = {}
    // spread the additional payload
    for (const numRange in this.additionalPayload) {
      const numbers = rangeParser(numRange)
      for (const n of numbers) {
        this.additionalPayload[n.toString()] = this.additionalPayload[numRange]
        // apply additional payload there, in case there're some properties like `speed` there
        if (numbers.includes(id)) Object.assign(this, this.additionalPayload[numRange])
      }
    }
  }

  move() {
    let now = new Date()
    if (this.lastTs != 0) {
      let supposedDistance = (now.getTime() - this.lastTs) * this.speed / 3600 // this.speed*1000 / (3600*1000)
      Object.assign(this, getForwardPos(this.segments, this.curtIdx, this.curtPos, supposedDistance))
    }

    this.lastTs = now.getTime()
    const payload = this.buildPayLoad()
    vehicleController.onVehicleReport(Object.assign(payload, this.additionalPayload[this.idStr]))
    if (this.fleet) {
      this.moveFleet(payload)
    }
  }

  moveFleet(_payload) {
    let curtResult = { curtIdx: this.curtIdx, curtPos: this.curtPos }
    for (let i = 2; i <= this.number; i++) {
      curtResult = getBackwardPos(this.segments, curtResult.curtIdx, curtResult.curtPos, this.intervalLength)
      vehicleController.onVehicleReport(Object.assign({},
        _payload, // standard payload of the head of the fleet
        { // id, location and heading properties of this vehicle
          vehID: this.IDPrefix + i.toString().padStart(4, "0"),
          lat: curtResult.curtPos.lat(),
          lng: curtResult.curtPos.lng(),
          heading: Math.round(this.segments[curtResult.curtIdx].heading),
        },
        // additional payload for this vehicle
        this.additionalPayload[i.toString()]))
    }
  }

  buildPayLoad() {
    // build the standard payload
    const reportTime = new Date()
    reportTime.setTime(this.lastTs)
    return {
      time: reportTime.toLocaleString(),
      route: this.route,
      vehType: this.type,
      vehID: this.vehID,
      // lat: from -85 to 85
      lat: this.curtPos.lat(),
      // lng: from -180 to 180
      lng: this.curtPos.lng(),
      heading: Math.round(this.segments[this.curtIdx].heading),
      speed: this.speed.toFixed(1) + " km/h",
      status: this.status,
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export { Vehicle }