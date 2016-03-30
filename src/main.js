/* @flow */

import {
  combine,
} from 'kefir'

import {
  fps,
} from './util'

import {
  dimensions,
  arrows,
} from './signals'

type Model = {
  x: number,
  y: number,
  vx: number,
  vy: number,
  dir: Direction,
}

type Direction = 'Left' | 'Right'

const mario: Model = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  dir: 'Right',
}

const update = (state: Model, key: Direction): Model => {
  return {
    ...state,
    dir: key,
  }
}

const view = ([[windowWidth, windowHeight], mario]) => {
  document.body.innerHTML = `<pre>${JSON.stringify({windowWidth, windowHeight, mario}, null, 2)}</pre>`
}

const delta = fps(30).map((t) => t / 20)
const input =
  arrows
    .sampledBy(delta)
    .concat(delta)

const main = combine([
  dimensions,
  input.scan(update, mario),
]).map(view)

main.log()
