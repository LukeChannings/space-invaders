import {
  h,
} from 'virtual-dom'

import {
  fromEvents,
  combine,
  interval,
  merge,
} from 'kefir'

const {
  max,
  min,
  ceil,
} = Math

const fps = 60
const fps$ =
  interval(1000 / fps)
    .map(() => Date.now())
    .diff((a, b) => b - a)
    .map((Δ) => Δ / 16)

const dimensions = () => [window.innerWidth, window.innerHeight]
const dimension$ =
  fromEvents(window, `resize`)
    .map(dimensions)
    .toProperty(dimensions)

const keyDown$ = fromEvents(window, `keydown`)
const keyUp$ = fromEvents(window, `keyup`)

const makeKey$ = ({key, up, down, useΔ, useEvent}) =>
    keyDown$
      .filter((e) => e.keyCode === key)
      .flatMapFirst((e) =>
        fps$
          .map((Δ) => useΔ ? Δ : useEvent ? e : down)
          .takeUntilBy(
            keyUp$
              .filter((e) => e.keyCode === key)
              .map((e) => useΔ ? null : useEvent ? e : up)))

const arrowLeft = { x: -1 }
const arrowRight = { x: 1 }
const arrowDefault = { x: 0 }

const arrowLeft$ =
  makeKey$({
    key: 37,
    down: arrowLeft,
    up: arrowDefault,
  }).toProperty(() => arrowDefault)

const arrowRight$ =
  makeKey$({
    key: 39,
    down: arrowRight,
    up: arrowDefault,
  }).toProperty(() => arrowDefault)

const cannon$ =
  merge([arrowLeft$, arrowRight$])
    .scan((cannon, key) => {
      return {
        ...cannon,
        x: max(min(100, cannon.x + key.x), 0),
      }
    }, { x: 50, y: 0 })

const firekeyFrequencyMs = 1000
const fireKey$ =
  makeKey$({ key: 38 })
    .throttle(firekeyFrequencyMs, {trailing: false})
    .map(() => global.performance.now())

const projectile$ =
  combine([fps$, cannon$, fireKey$])
    .scan((projectiles, [Δ, cannon, firedTime]) => {
      const isNewProjectile =
        global.performance.now() - firedTime < 5 &&
        !projectiles.filter(({id}) => firedTime === id).length

      return [
        ...(isNewProjectile ? [{id: firedTime, x: cannon.x, y: 0}] : []),
        ...projectiles.reduce((ps, p) =>
          ceil(p.y) < 100 ? [...ps, { ...p, y: p.y + Δ }] : ps, [])
      ]
    }, [])

const view = ([[width, height], cannon, projectiles]) => {
  const cannonX = (width - 50) * (cannon.x / 100)
  global.projectiles = projectiles
  return (
    <div className={`game`} style={{width: `${width}px`, height: `${height}px`}}>
      <div className={`cannon`} style={{left: `${cannonX}px`}}></div>
      {projectiles.length && projectiles.map(({x, y, id}) => {
        const projectileX = width * (x / 100)
        const projectileY = y < 100 ? 40 + height * (y / 100) : null
        return (
          <div
            key={id}
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
