import {
  combine,
} from 'kefir'

import {
  h,
} from 'virtual-dom'

import {
  dimension$,
  arrow$,
  fps,
} from './signals'

const {
  max,
  min,
} = Math

export default (persistedState) => {
  const cannon = {
    x: (window.innerWidth / 2) - 25,
    y: 0,
    vx: 0,
    vy: 0
  }

  const initialState = persistedState || {
    cannon,
  }

  const update = (state, [key, Δ]) => {
    return [
      move(key),
      physics(Δ),
    ].reduce((context, f) => f(context), state)
  }

  const move = (key) => (state) => {
    return {
      ...state,
      cannon: {
        ...state.cannon,
        vx: key.x * 10,
      },
    }
  }

  const physics = (Δ) => (state) => {
    return {
      ...state,
      cannon: {
        ...state.cannon,
        x: min(max(0, state.cannon.x + Δ * state.cannon.vx), window.innerWidth - 50),
      },
    }
  }

  const view = ([[windowWidth, windowHeight], {cannon}]) =>
  <div className={`game`} style={`width: ${windowWidth}px; height: ${windowHeight}px`}>
    <div className={`cannon`} style={`left: ${cannon.x}px; bottom: ${cannon.y}px`}></div>
  </div>

  const delta = fps(30).map((t) => t / 20)

  const input =
  arrow$
  .sampledBy(delta)
  .zip(delta)

  const model$ = input.scan(update, initialState)

  return {
    default: combine([ dimension$, model$ ]).map(view),
    model$,
  }
}
