import {
  combine,
} from 'kefir'

import {
  dimension$,
  arrow$,
  fps,
} from './signals'

import {
  h,
} from 'virtual-dom'

const {
  max,
  min,
} = Math

const cannon = {
  x: (window.innerWidth / 2) - 25,
  y: 0,
  vx: 0,
  vy: 0,
  dir: `Right`,
}

const update = (state, [key, Δ]) => {
  return [
    walk(key),
    physics(Δ),
  ].reduce((context, f) => f(context), state)
}

const walk = (key) => (state) => {
  return {
    ...state,
    dir: key.x < 0 ? `Left`
       : key.x > 0 ? `Right`
       : state.dir,
    vx: key.x * 10,
  }
}

const physics = (Δ) => (state) => {
  return {
    ...state,
    x: min(max(0, state.x + Δ * state.vx), window.innerWidth - 50),
  }
}

const view = ([[windowWidth, windowHeight], cannon]) =>
  <div className={`game`} style={`width: ${windowWidth}px; height: ${windowHeight}px`}>
    <div className={`cannon`} style={`left: ${cannon.x}px; bottom: ${cannon.y}px`}></div>
  </div>

const delta = fps(30).map((t) => t / 20)

const input =
  arrow$
    .sampledBy(delta)
    .zip(delta)

export default combine([
  dimension$,
  input.scan(update, cannon),
]).map(view)
