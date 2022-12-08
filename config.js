import log from 'loglevel';

const appConfig = {
  //"trace","debug","info","warn","error"
  "logLevel": "debug",

  "mqtt": {
    host: "localhost",
    port: 1883,
    clientId: "connected-vehicle-data-generator",
    username: "default",
    password: "default",
  },

  "vehicles": [
    {
      route: "R1",       // must be the id of one of routes
      type: "HAUL",
      number: 10,
      speed: 50,         // km/hour
      IDPrefix: "HW",    // the id will be from IDPrefix+"001" to IDPrefix+"010"
      reportInterval: 3, // seconds

    }
  ],

  "routes": [{
    "id": "R1",
    "coordinates": [
      [
        119.670202,
        -23.359829,
      ],
      [
        119.6686864,
        -23.3599466,
      ],
      [
        119.6686864,
        -23.3599466,
      ],
      [
        119.6678925,
        -23.3603996,
      ],
      [
        119.6686435,
        -23.360636,
      ],
      [
        119.6697164,
        -23.3610497,
      ],
      [
        119.6711755,
        -23.3610103,
      ],
      [
        119.6711755,
        -23.3610103,
      ],
      [
        119.6725059,
        -23.3600648,
      ],
      [
        119.6723771,
        -23.3595526,
      ],
      [
        119.6719909,
        -23.3592571,
      ],
      [
        119.6703172,
        -23.3589616,
      ],
      [
        119.668622,
        -23.3586267,
      ],
      [
        119.6674848,
        -23.3597496,
      ],
      [
        119.6670556,
        -23.3606557,
      ],
      [
        119.6677208,
        -23.3609118,
      ],
      [
        119.668901,
        -23.3612861,
      ],
      [
        119.6697378,
        -23.3620149,
      ],
      [
        119.6713901,
        -23.3624483,
      ],
      [
        119.6717763,
        -23.3630786,
      ],
      [
        119.6723342,
        -23.3630589,
      ],
      [
        119.6726346,
        -23.3620346,
      ],
      [
        119.6732569,
        -23.3613452,
      ],
      [
        119.6737933,
        -23.3617194,
      ],
      [
        119.6735573,
        -23.3623498,
      ],
      [
        119.6729779,
        -23.3637484,
      ],
      [
        119.671905,
        -23.3655803,
      ],
      [
        119.6715832,
        -23.3668804,
      ],
      [
        119.6714544,
        -23.3678062,
      ],
      [
        119.6718407,
        -23.3681804,
      ],
      [
        119.6728277,
        -23.3671364,
      ],
      [
        119.6733642,
        -23.3660925,
      ],
      [
        119.6747375,
        -23.3650288,
      ],
      [
        119.6753812,
        -23.3645166,
      ],
      [
        119.6759176,
        -23.3649303,
      ],
      [
        119.6756601,
        -23.3659349,
      ],
      [
        119.67448,
        -23.366841,
      ],
      [
        119.6745014,
        -23.3673531,
      ],
      [
        119.6752524,
        -23.3675698,
      ],
      [
        119.6764541,
        -23.3671955,
      ],
      [
        119.6772265,
        -23.3669986,
      ],
      [
        119.6782351,
        -23.367491,
      ],
      [
        119.6782351,
        -23.367491,
      ],
      [
        119.6790504,
        -23.3679834,
      ],
    ],
  }]

}

function checkConfig() {
  try {
    const routeIDs = appConfig.routes.map(r => r.id)
    for (const veh of appConfig.vehicles) {
      if (routeIDs.indexOf(veh.route) == -1) {
        log.error(`Can NOT find route with id==${veh.route} in ${fileName}`)
        process.exit(1)
      }
      if (!Number.isInteger(veh.number)) {
        log.error(`The number ${veh.number} of vehicle('${veh.type}') must be integer`)
        process.exit(1)
      }
    }
  } catch (err) {
    log.error(err);
    return null
  }
}
const logLevel = appConfig.logLevel
log.setLevel(logLevel)
checkConfig()
export { appConfig }