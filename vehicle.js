import log from 'loglevel';
import { vehicleController } from "./controller.js"

class Vehicle {
  constructor() {
    this.lastTs = 0
    this.status = "OK"
  }
  move() {
    let now = new Date()
    let speed = 0

    if (this.lastTs != 0) {
      const elapse = now.getTime() - this.lastTs // milliseconds

      let supposedDistance = elapse * this.speed / 3600 // this.speed*1000 / (3600*1000)
      let realDistance = 0 // meter
      while (supposedDistance > 0) {
        let curtSeg = this.line[this.curtIdx]
        if (supposedDistance < (curtSeg.distance / 2)) {
          break
        } else {
          this.curtIdx = this.curtIdx < (this.line.length - 1) ? this.curtIdx + 1 : 0
          supposedDistance = supposedDistance - curtSeg.distance
          realDistance = realDistance + curtSeg.distance
        }
      }
      speed = realDistance * 3600 / elapse
    }

    this.lastTs = now.getTime()
    vehicleController.onVehicleReport(this.buildPayLoad({
      speed: speed.toFixed(1) + " km/h",
    }))
  }

  buildPayLoad(payload) {
    let curtSeg = this.line[this.curtIdx]
    const now = new Date()
    now.setTime(this.lastTs)

    return Object.assign({
      time: now.toLocaleString(),
      route: this.route,
      vehType: this.type,
      vehID: this.id,
      // lat: from -85 to 85
      lat: curtSeg.position.lat(),
      // lng: from -180 to 180
      lng: curtSeg.position.lng(),
      heading: curtSeg.heading,
      status: this.status,
    }, payload)
  }
}

export { Vehicle }