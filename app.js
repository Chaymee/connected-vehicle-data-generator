const fs = require('fs');
const TOML = require('@ltd/j-toml');
const mqtt = require('mqtt');
const path = require('path');

function readConfig() {
  try {
    const data = fs.readFileSync('./config.toml', { encoding: 'utf8' });
    return TOML.parse(data, { bigint: false })
  } catch (err) {
    console.log(err);
  }
}
class Vehicle {
  constructor(mqttClient, route, vehID) {
    this.id = route.id
    this.mqttClient = mqttClient
    this.vehID = vehID
    this.count = 0
    this.i = 0
    this.forward = true
    this.path = route.path
  }

  move() {
    let p = this.path[this.i]
    let topic = `acmeResources/veh_trak/gps/v2/${this.id}/vehType/${this.vehID}/${p[1]}/${p[0]}/dir/OK`
    let payload = {
      route: this.id,
      vehType: "vehType",
      vehID: this.vehID,
      lat: p[1],
      lng: p[0],
      dir: "dir",
      status: "OK",
    }
    this.mqttClient.publish(topic, JSON.stringify(payload))
    this.count++
    console.log(`Send: ${this.count}, [${this.i}], ${topic}`)
    if (this.forward) {
      if (this.i >= this.path.length - 1) {
        this.forward = false
      } else {
        this.i++
      }
    } else {
      if (this.i <= 0) {
        this.forward = true
      } else {
        this.i--
      }
    }
  }
}

const config = readConfig()
// connect to broker
const client = mqtt.connect(config.mqtt)
client.on('connect', function () {
  console.log("Connected, start to send gps messages ...")
  let vehicle = new Vehicle(client, config.routes[0], "V80F")
  setInterval(() => { vehicle.move() }, 1000)
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
})


client.on('error', (err) => {
  console.error("Error: " + err.message)
  client.end()
})


