import {
  combine,
  sequentially,
  never,
  constant,
} from 'kefir'

import {
  range,
} from 'lodash'

import {
  arrowsPressed$,
  spaceBarPressed$,
} from './signals.arrows'

const STEP = 3

const enforceBounds = (n, min = 0, max = 100) =>
  n < min ? min : n > max ? max : n

const cannonPosition$ =
  arrowsPressed$.scan((prev, [left, right]) => {
    if (left && !right) {
      return enforceBounds(prev - STEP)
    } else if (!left && right) {
      return enforceBounds(prev + STEP)
    } else {
      return prev
    }
  }, 50).toProperty(() => 50)

const projectile$ =
  combine([
    spaceBarPressed$,
    cannonPosition$,
  ])
  .scan((ps, [spaceBarPressed, cannonPosition]) => {
    if (spaceBarPressed) {
      return ps.merge(combine([
        constant(cannonPosition),
        sequentially(10, range(0, 100))
      ]))
    } else {
      return ps
    }
  }, never())
  // .flatMapConcat(([spaceBarPressed, cannonPosition]) => {
  //   if (spaceBarPressed) {
  //     return combine([
  //       constant(cannonPosition),
  //       sequentially(10, range(0, 100))
  //     ])
  //   } else {
  //     return never()
  //   }
  // })

const streams = [
  cannonPosition$,
  projectile$,
]

const mapStreamStructure = (
  cannonPosition,
  projectiles,
) => {
  console.log(projectiles)
  return {
    cannonPosition,
  }
}

export default combine(streams, mapStreamStructure).toProperty()
