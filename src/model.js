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

import {
  range,
  inRange,
} from 'lodash'

const fps = 60
const fps$ =
  interval(1000 / fps)
    .map(() => global.performance.now())
    .diff((a, b) => b - a)
    .map((Δ) => Δ / 16)

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

const arrowDefault = { x: 0 }

const arrowLeft = { x: -1 }
const arrowLeft$ =
  makeKey$({
    key: 37,
    down: arrowLeft,
    up: arrowDefault,
  }).toProperty(() => arrowDefault)

const arrowRight = { x: 1 }
const arrowRight$ =
  makeKey$({
    key: 39,
    down: arrowRight,
    up: arrowDefault,
  }).toProperty(() => arrowDefault)

const cannon = { x: 50, lives: 3 }
const cannon$ =
  merge([arrowLeft$, arrowRight$])
    .scan((cannon, {x}) =>
      Object.assign({}, cannon, { x: min(100, max(0, cannon.x + x)) }), cannon)

const firekeyFrequencyMs = 1000
const fireKey$ =
  makeKey$({ key: 38 })
    .throttle(firekeyFrequencyMs, {trailing: false})
    .map(() => global.performance.now())

const cannonProjectiles = []
const cannonProjectile$ =
  combine([fps$, cannon$, fireKey$])
    .scan((cannonProjectiles, [Δ, cannon, firedTime]) => {
      const isNewProjectile =
        global.performance.now() - firedTime < 5 &&
        !cannonProjectiles.filter(({id}) => firedTime === id).length

      return [
        ...(isNewProjectile ? [{id: firedTime, x: cannon.x, y: 0}] : []),
        ...cannonProjectiles.reduce((ps, p) =>
          ceil(p.y) < 100 ? [...ps, { ...p, y: p.y + Δ }] : ps, [])
      ]
    }, cannonProjectiles)

const invaders =
  range(4).map((rowIndex) =>
    range(11).map((columnIndex) => {
      return {
        type: [0, 1, 1, 2][rowIndex],
        x: 10 + ((columnIndex / 11) * 80),
        y: 95 - (rowIndex * 10),
      }
    }))
const invaders$ =
  cannonProjectile$
    .scan((invaderRows, projectiles) => {
      if (!projectiles.length) {
        return invaderRows
      } else {
        return invaderRows.map((row) => {
          return row.reduce((invaders, invader) => {
            const hits = projectiles.filter((projectile) => {
              if (inRange(projectile.x, invader.x, invader.x + 7) &&
                  inRange(projectile.y, invader.y, invader.y + 7)) {
                return true
              }
            })
            return hits.length ? invaders : invaders.concat(invader)
          }, [])
        })
      }
    }, invaders)

const dimensions = () => [window.innerWidth, window.innerHeight]
const dimension$ =
  fromEvents(window, `resize`)
    .map(dimensions)
    .toProperty(dimensions)

export default combine([
  dimension$,
  cannon$,
  cannonProjectile$,
  invaders$
], (...data) => {
  return {
    dimensions: {
      width: data[0][0],
      height: data[0][1],
    },
    cannon: data[1],
    cannonProjectiles: data[2],
    invaderRows: data[3],
  }
})
