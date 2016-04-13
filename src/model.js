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

const cannon = { x: 50 }
const cannon$ =
  merge([arrowLeft$, arrowRight$])
    .scan((cannon, {x}) =>
      Object.assign({}, cannon, { x: min(100, max(0, cannon.x + x)) }), cannon)

const firekeyFrequencyMs = 100
const fireKey$ =
  makeKey$({ key: 38 })
    .throttle(firekeyFrequencyMs, {trailing: false})
    .map(() => global.performance.now())

const projectiles = []
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
    }, projectiles)

const dimensions = () => [window.innerWidth, window.innerHeight]
const dimension$ =
  fromEvents(window, `resize`)
    .map(dimensions)
    .toProperty(dimensions)

export default combine([ dimension$, cannon$, projectile$ ])
