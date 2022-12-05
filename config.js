import fs from 'fs';
import TOML from '@ltd/j-toml';
import log from 'loglevel';

function isInteger(value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
};

function readConfig() {
  try {
    const fileName = './config.toml'
    const data = fs.readFileSync(fileName, { encoding: 'utf8' });
    const result = TOML.parse(data, { bigint: false })
    log.setLevel(result.loglevel)

    const routeIDs = result.routes.map(r => r.id)
    for (const veh of result.vehicles) {
      if (routeIDs.indexOf(veh.route) == -1) {
        log.error(`Can NOT find route with id==${veh.route} in ${fileName}`)
        process.exit(1)
      }
      if (!isInteger(veh.number)) {
        log.error(`The number ${veh.number} of vehicle('${veh.type}') must be integer`)
        process.exit(1)
      }

      return result
    }
  } catch (err) {
    log.error(err);
    return null
  }
}

const appConfig = readConfig()
export { appConfig }