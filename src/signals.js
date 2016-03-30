/* @flow */
import {
  Property,
  Stream,

  fromEvents,
} from 'kefir'

type Dimensions = [number, number]

const currentDimensions = (): Dimensions => [window.innerWidth, window.innerHeight]

export const dimensions: Property =
  fromEvents(window, 'resize')
    .map(currentDimensions)
    .toProperty(currentDimensions)

export const arrows: Stream =
  fromEvents(window, 'keydown')
    .filter((e) => e.keyCode === 37 || e.keyCode === 39)
    .map((e) => {
      return {
        '37': 'Left',
        '39': 'Right',
      }[String(e.keyCode)]
    })
