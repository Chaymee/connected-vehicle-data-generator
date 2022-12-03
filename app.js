const fs = require('fs');
const TOML = require('@ltd/j-toml');
var config = ""

function readConfig() {
  try {
    const data = fs.readFileSync('./config.toml', { encoding: 'utf8' });
    return TOML.parse(data)
  } catch (err) {
    console.log(err);
  }
}

config = readConfig()
console.log(config)

console.log(config)
