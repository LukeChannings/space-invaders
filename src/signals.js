import {
  fromEvents,
  interval,
  merge,
} from 'kefir'

import {
  mapValues,
} from 'lodash'

const currentDimensions = () => [window.innerWidth, window.innerHeight]

export const dimension$ =
  fromEvents(window, `resize`)
    .map(currentDimensions)
    .toProperty(currentDimensions)

export const keyDown$ = fromEvents(window, `keydown`)
export const keyUp$ = fromEvents(window, `keyup`)

const arrowsHash = {
  37: { x: -1 },
  38: { y: 1 },
  39: { x: 1 },
  40: { y: -1 },
}

const arrowsInitial =
  { x: 0, y: 0 }

export const arrow$ =
  merge([ keyDown$, keyUp$ ])
  .filter(({keyCode: k}) => k >= 37 && k <= 40)
  .map(({ type, keyCode }) =>
    type === `keydown`
      ? arrowsHash[keyCode]
      : mapValues(arrowsHash[keyCode], () => 0))
  .scan((prev, next) => Object.assign({}, prev, next), arrowsInitial)

export const fps = (v) =>
  interval(1000 / v)
    .map(() => Number(new Date))
    .bufferWithCount(2)
    .map(([t1, t2]) => t2 - t1)
