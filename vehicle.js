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
    this.id = this.IDPrefix + id.toString().padStart(4, "0")
    this.segments = segments
    this.curtIdx = getRandomInt(this.segments.length)
    this.lastTs = 0
    this.curtPos = this.segments[this.curtIdx].fromPos
    if (!("status" in this)) this.status = "OK"
    if (!("fleetStatus" in this)) this.fleetStatus = {}
    for (const numRange in this.fleetStatus) {
      const numbers = rangeParser(numRange)
      if (numbers.length > 1) for (const num of numbers) {
        this.fleetStatus['' + num] = this.fleetStatus[numRange]
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
    vehicleController.onVehicleReport(payload)
    if (this.fleet) {
      this.moveFleet(payload)
    }
  }

  moveFleet(_payload) {
    let curtResult = { curtIdx: this.curtIdx, curtPos: this.curtPos }
    for (let i = 2; i <= this.number; i++) {
      let payload = { ..._payload }
      curtResult = getBackwardPos(this.segments, curtResult.curtIdx, curtResult.curtPos, this.intervalLength)
      payload.vehID = this.IDPrefix + i.toString().padStart(4, "0")
      payload.lat = curtResult.curtPos.lat()
      payload.lng = curtResult.curtPos.lng()
      payload.heading = Math.round(this.segments[curtResult.curtIdx].heading)
      payload.status = this.fleetStatus['' + i] ? this.fleetStatus['' + i] : payload.status

      vehicleController.onVehicleReport(payload)
    }
  }

  buildPayLoad() {
    return {
      time: new Date().setTime(this.lastTs).toLocaleString(),
      route: this.route,
      vehType: this.type,
      vehID: this.id,
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