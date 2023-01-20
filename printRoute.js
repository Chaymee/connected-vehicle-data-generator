import { appConfig } from './config.js'
import { route2segments } from './route.js'

for (const route of appConfig.routes) {
  route2segments(route)

  const len = route.segments.length
  console.log(`\n\n===${route.id}`)
  for (const seg of route.segments) {
    console.log(seg.fromPos.lng(), ",", seg.fromPos.lat())
  }
  console.log(route.segments[len - 1].toPos.lng(), ",", route.segments[len - 1].toPos.lat())
}
