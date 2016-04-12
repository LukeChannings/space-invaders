import {
  h,
} from 'virtual-dom'

import {
  fromEvents,
  combine,
  interval,
  repeat,
} from 'kefir'

const {
  max,
  min,
} = Math

const getCurrentDimensions = () =>
  [window.innerWidth, window.innerHeight]

const dimension$ =
  fromEvents(window, `resize`)
    .map(getCurrentDimensions)
    .toProperty(getCurrentDimensions)

const keyDown$ = fromEvents(window, `keydown`)
const keyUp$ = fromEvents(window, `keyup`)

const KEYUP = { x: 0 }
const LEFT = { x: -1 }
const RIGHT = { x: 1 }

const leftAndRightArrow$ =
  repeat(() =>
    keyDown$
      .filter(({keyCode: k}) => ~[37, 39].indexOf(k))
      .flatMapFirst(({keyCode}) =>
        interval(16)
          .map(() => ({ 37: LEFT, 39: RIGHT })[keyCode])
          .takeUntilBy(
            keyUp$
              .filter((e) => e.keyCode === keyCode)
              .map(() => KEYUP))))
                .toProperty(() => KEYUP)

const cannon$ =
  leftAndRightArrow$
    .scan((cannon, key) => {
      return {
        ...cannon,
        x: max(min(100, cannon.x + key.x), 0),
      }
    }, { x: 50, y: 0 })

const fireKey$ =
  repeat(() =>
    keyDown$
      .filter((e) => e.keyCode === 38)
      .throttle(1500, {trailing: false})
      .map(() => Date.now()))

const projectile$ =
  combine([ cannon$, fireKey$ ])
    .flatMap(([cannon, keyup]) =>
      (Date.now() - keyup) < 5
        ? interval(100, 1)
            .take(30)
            .scan((y, Δ) => y + (Δ * 3.3333), 0)
            .map((y) => [keyup, cannon.x, y])
        : false)
    .withHandler(((() => {
      const projectiles = {}
      return (emitter, event) => {
        if (event.type === `value`) {
          const [
            id,
            x,
            y,
          ] = event.value

          projectiles[id] = { x, y }

          emitter.emit(
            Object
              .keys(projectiles)
              .map((k) => projectiles[k])
              .reduce((ps, p) => ps.concat(p.y === 100 ? [] : p), []))
        }
      }
    })()))
    .toProperty(() => [])

const view = ([[width, height], cannon, projectiles]) => {
  const cannonX = (width - 50) * (cannon.x / 100)
  return (
    <div className={`game`} style={{width: `${width}px`, height: `${height}px`}}>
      <div className={`cannon`} style={{left: `${cannonX}px`}}></div>
      {projectiles.length && projectiles.map(({x, y}, i) => {
        const projectileX = width * (x / 100)
        const projectileY = y < 100 ? 40 + height * (y / 100) : null
        return (
          <div
            key={i}
            className={`projectile`}
            style={{
              left: `${projectileX}px`,
              bottom: `${projectileY}px`
            }}>
          </div>
        )
      })}
    </div>
  )
}

export default combine([
  dimension$,
  cannon$,
  projectile$,
]).map(view)
