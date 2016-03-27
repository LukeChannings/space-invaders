import {
  fromEvents,
  combine,
} from 'kefir'

const keyDown$ = fromEvents(document.body, `keydown`)

const keyUp$ = fromEvents(document.body, `keyup`)

const transformKey$ = (stream, keyCode, initialValue) =>
  stream
    .filter((e) => e.keyCode === keyCode)
    .map((e) => e.timeStamp)
    .toProperty(() => initialValue)

const keyPressed$ = (keyCode) =>
  combine([
    transformKey$(keyDown$, keyCode, 0),
    transformKey$(keyUp$, keyCode, 0),
  ], (a, b) => a > b)

export const leftArrowPressed$ = keyPressed$(37)

export const rightArrowPressed$ = keyPressed$(39)

export const arrowsPressed$ =
  combine([
    keyPressed$(37),
    keyPressed$(39),
  ])

export const spaceBarPressed$ =
  keyPressed$(32)
