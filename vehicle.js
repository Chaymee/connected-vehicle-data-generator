import log from 'loglevel';
import * as geometry from 'spherical-geometry-js';
import { vehicleController } from "./controller.js"

class Vehicle {
  constructor(...options) {
    Object.assign(this, ...options)
    this.lastTs = 0
    this.curtPos = this.segments[this.curtIdx].position
    if (!("status" in this)) this.status = "OK"
  }
  move() {
    let now = new Date()
    if (this.lastTs != 0) {
      let supposedDistance = (now.getTime() - this.lastTs) * this.speed / 3600 // this.speed*1000 / (3600*1000)

      while (supposedDistance > 0) {
        const curtSeg = this.segments[this.curtIdx]
        const segRemainingDistance = curtSeg.distance - geometry.computeDistanceBetween(curtSeg.position, this.curtPos)
        if (supposedDistance < segRemainingDistance) {
          this.curtPos = geometry.computeOffset(this.curtPos, supposedDistance, curtSeg.heading)
          break
        } else {
          this.curtIdx = this.curtIdx < (this.segments.length - 1) ? this.curtIdx + 1 : 0
          this.curtPos = this.segments[this.curtIdx].position
          supposedDistance = - segRemainingDistance
        }
      }
    }

    this.lastTs = now.getTime()
    vehicleController.onVehicleReport(this.buildPayLoad())
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

export { Vehicle }