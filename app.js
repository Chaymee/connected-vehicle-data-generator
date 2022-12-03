const fs = require('fs');
const TOML = require('@ltd/j-toml');
const mqtt = require('mqtt')

function readConfig() {
  try {
    const data = fs.readFileSync('./config.toml', { encoding: 'utf8' });
    return TOML.parse(data, { bigint: false })
  } catch (err) {
    console.log(err);
  }
}

const config = readConfig()
console.log(JSON.stringify(config, null, 2))
// connect to broker
const client = mqtt.connect(config.mqtt)
client.on('connect', function () {
  client.subscribe('try-me', function (err) {
    if (!err) {
      // Publish a message to a topic
      client.publish('try-me', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
})


client.on('error', (err) => {
  console.error("Error: " + err.message)
  client.end()
})

console.log("The End")
