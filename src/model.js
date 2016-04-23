import {
  fromEvents,
  combine,
  interval,
  merge,
  pool,
  repeat,
} from 'kefir'

const {
  max,
  min,
  ceil,
  floor,
} = Math

import {
  range,
  inRange,
  get,
} from 'lodash'

const windowFocused$ =
  merge([
    fromEvents(window, `blur`).map(() => false),
    fromEvents(window, `focus`).map(() => true),
  ]).toProperty(() => true)

const dimensions = () => [window.innerWidth, window.innerHeight]
const dimension$ =
  fromEvents(window, `resize`)
    .map(dimensions)
    .toProperty(dimensions)

const fps = 60
const fps$ =
  repeat(() =>
    combine([ windowFocused$, interval(1000 / fps) ])
      .takeWhile(([focused]) => focused)
      .map(() => performance.now())
      .diff((a, b) => b - a)
      .map((Δ) => Δ / 16))
      // .take(1)

const keyDown$ = fromEvents(window, `keydown`)
const keyUp$ = fromEvents(window, `keyup`)

const makeKey$ = ({key, up, down}) =>
    keyDown$
      .filter((e) => e.keyCode === key)
      .flatMapFirst(() =>
        fps$
          .map(() => down)
          .takeUntilBy(
            keyUp$
              .filter((e) => e.keyCode === key)
              .map(() => up)))

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

const firekeyFrequencyMs = 100
const fireKey$ =
  makeKey$({ key: 38 })
    .throttle(firekeyFrequencyMs, {trailing: false})
    .map(() => performance.now())

const collision$ = pool()

const cannonProjectiles = [
  // {
  //   x: 44,
  //   y: 45,
  //   id: performance.now(),
  // }
]
const cannonProjectile$ =
  combine([fps$, cannon$, fireKey$, collision$])
    .scan((cannonProjectiles, [Δ, cannon, firedTime, collision]) => {
      const collisionId = get(collision, `projectile.id`, NaN)
      const isNewProjectile =
        performance.now() - firedTime < 5 &&
        !cannonProjectiles.filter(({id}) => firedTime === id).length

      return [
        ...(isNewProjectile ? [{id: firedTime, x: cannon.x, y: 0}] : []),
        ...cannonProjectiles.reduce((ps, p) =>
          ceil(p.y) < 100 && p.id !== collisionId ? [...ps, { ...p, y: p.y + Δ }] : ps, [])
      ]
    }, cannonProjectiles)

const invaderDirection = 1
const invaderSpeed = 90
const invaderRowCount = 4
const invadersPerRow = 11
const invaderTopOffset = 20
const invaderTypes =
  [
    { type: `small`, points: 40, area: 3 },
    { type: `medium`, points: 20, area: 4 },
    { type: `large`, points: 10, area: 5 },
  ]

const invaders =
  range(invaderRowCount * invadersPerRow)
    .map((_, index) => {
      const column = index % invadersPerRow
      const row = floor(index / invadersPerRow)
      return {
        id: index,
        column,
        x: 10 + ((column / (invadersPerRow - 1)) * 80),
        y: (100 - invaderTopOffset) - (row * 10),
        ...(invaderTypes[[0, 1, 1, 2][row]]),
      }
    })

const invaders$ =
  combine([fps$, collision$])
    .scan(([invaders, direction], [Δ, collision]) => {
      const columns = invaders.map((invader) => invader.column)
      const hitAnEdge =
          !!invaders.filter(({column, x}) =>
            (column === min(...columns) || column === max(...columns)) &&
            (floor(x) === 0 || ceil(x) === 100)).length

      const direction_ = hitAnEdge ? +!direction : direction

      const invaders_ =
        (collision ? invaders.filter(({id}) => id !== collision.invader.id) : invaders)
          .map((invader) => {
            return {
              ...invader,
              x: invader.x + ((direction_ === 1 ? Δ : -Δ) / invaderSpeed),
              ...(hitAnEdge ? { y: invader.y - 5 } : {})
            }
          })

      return [invaders_, direction_]
    }, [invaders, invaderDirection])

const score$ =
  collision$.scan((score, collision) =>
    collision
      ? collision.invader.points + score
      : score, 0)

collision$.plug(
  combine([cannonProjectile$, invaders$])
    .map(([projectiles, [invaders]]) => {
      if (projectiles.length) {
        const collisions =
          invaders.reduce((collisions, invader) => {
            const projectilesWithHits = projectiles.filter((projectile) => {
              const offset = invader.area / 2
              if (inRange(projectile.x, floor(invader.x - offset), ceil(invader.x + offset)) &&
                  inRange(projectile.y, floor(invader.y - invader.area), ceil(invader.y))) {
                console.log(projectile, invader)
                return true
              }
            })

            const collision = projectilesWithHits.length &&
              { invader, projectile: projectilesWithHits[0] }

            return collision ? collisions.concat(collision) : collisions
          }, [])

        if (collisions.length) {
          return collisions[0]
        }
      }
      return false
    })
    .sampledBy(fps$))

export default combine([
  dimension$,
  cannon$,
  cannonProjectile$,
  invaders$,
  score$,
], (...data) => {
  return {
    dimensions: {
      width: data[0][0],
      height: data[0][1],
    },
    cannon: data[1],
    cannonProjectiles: data[2],
    invaders: data[3][0],
    score: data[4],
  }
})
