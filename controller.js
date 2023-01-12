import log from 'loglevel';

import { appConfig } from './config.js'
import { route2segments } from './route.js'
import { Vehicle } from './vehicle.js';
import mqtt from 'mqtt';


// vehicle controller
const vc = {
  mqttClient: null,
  vehicles: {},
  routesMap: {},

  // initialize everything based on configuration
  init: function () {
    // init all routes
    for (const route of appConfig.routes) {
      vc.routesMap[route.id] = route
      route2segments(route)
    }

    // init vehicles
    for (const vehConfig of appConfig.vehicles) {
      const segments = vc.routesMap[vehConfig.route].segments
      log.info(`Init ${vehConfig.number} ${vehConfig.type} vehicles on route ${vehConfig.route}`)
      const numberOfVehicles = vehConfig.fleet ? 1 : vehConfig.number
      for (let i = 1; i <= numberOfVehicles; i++) {
        const vehicle = new Vehicle({
          "id": vehConfig.IDPrefix + i.toString().padStart(4, "0"),
          "segments": segments,
          "curtIdx": getRandomInt(segments.length),
        }, vehConfig)
        vc.vehicles[vehicle.id] = vehicle
      }
    }
  },

  initMqtt: function (onConnected) {
    // connect to broker
    let startTime = new Date()
    log.info(startTime.toLocaleString() + ": start to connect to " + appConfig.mqtt.brokerUrl)
    vc.mqttClient = mqtt.connect(appConfig.mqtt.brokerUrl, appConfig.mqtt.clientOptions)

    vc.mqttClient.on('connect', function () {
      log.info("Connected, ready to send mqtt messages ...")
      onConnected()
    })

    vc.mqttClient.on('message', function (topic, message) {
      console.warn("Received message: " + message.toString())
    })

    vc.mqttClient.on('error', (err) => {
      let nowTime = new Date()
      log.error(nowTime.toLocaleString() + ": " + err.message)
      if (nowTime - startTime > 300 * 1000) { // 5 minutes
        log.error("TIME OUT, unable to connect to the broker " + appConfig.mqtt.brokerUrl)
        vc.mqttClient.end()
        process.exit()
      }
    })
  },

  start: function () {
    vc.initMqtt(() => vc.startAllVehicles())
  },

  // start all vehicles
  startAllVehicles: function () {
    log.info(`Start all ${Object.keys(vc.vehicles).length} vehicles`)
    log.info("Press Ctrl+C to exit ...")
    for (const [vehId, vehicle] of Object.entries(vc.vehicles)) {
      setTimeout(() => {
        vehicle.move()
        setInterval(() => vehicle.move(), 1000 * vehicle.reportInterval)
      }, Math.random() * 1000 * vehicle.reportInterval)
    }
  },


  onVehicleReport: function (payload) {
    const topic = `${appConfig.topicPrefix}${payload.route}/${payload.vehType}/${payload.vehID}/` +
      `${formatGpsCoord(payload.lat, "lat")}/${formatGpsCoord(payload.lng, "lng")}/` +
      `${payload.heading.toFixed(0)}/${payload.status}`
    vc.mqttClient.publish(topic, JSON.stringify(payload))
    log.debug(topic)
  }
}


// 5 decimal places should be good enough
// according to (https://sites.google.com/site/trescopter/Home/concepts/required-precision-for-gps-calculations)
const gpsSmallestUnit = "0.00001"
const fixedLength = gpsSmallestUnit.split(".")[1].length // 5
function formatGpsCoord(coord, dim) {
  // lng: -180~180, lat: -90~90
  let wholeLength = dim === "lng" ? fixedLength + 4 : fixedLength + 3
  let result = coord.toFixed(fixedLength);
  if (result[0] === '-') {
    result = result.slice(1).padStart(wholeLength, '0');
    result = '-' + result;
  } else {
    result = result.padStart(wholeLength, '0');
  }
  return result
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export { vc as vehicleController }