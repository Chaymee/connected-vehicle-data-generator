import fs from 'fs';
import TOML from '@ltd/j-toml';
import mqtt from 'mqtt';

function readConfig() {
  try {
    const data = fs.readFileSync('./config.toml', { encoding: 'utf8' });
    return TOML.parse(data, { bigint: false })
  } catch (err) {
    console.log(err);
  }
}
class Vehicle {
  constructor(mqttClient, route, vehID, i) {
    this.id = route.id
    this.mqttClient = mqttClient
    this.vehID = vehID
    this.count = 0
    this.i = i
    this.forward = true
    this.coordinates = route.coordinates
  }

  move() {
    let p = this.coordinates[this.i]
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
      if (this.i >= this.coordinates.length - 1) {
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
  let vehicle1 = new Vehicle(client, config.routes[0], "V80F", 0)
  let vehicle2 = new Vehicle(client, config.routes[0], "VX01", 20)
  setInterval(() => { vehicle1.move(); vehicle2.move() }, 1000)
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
})


client.on('error', (err) => {
  console.error("Error: " + err.message)
  client.end()
})


