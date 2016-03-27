import {
  combine,
} from 'kefir'

import {
  arrowsPressed$,
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

const streams = [
  cannonPosition$,
]

const mapStreamStructure = (
  cannonPosition
) => {
  return {
    cannonPosition,
  }
}

export default combine(streams, mapStreamStructure).toProperty()
