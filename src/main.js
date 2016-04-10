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

import {
  HEIGHT,
  MIDDLE,
  CANNON_WIDTH,
  CANNON_HEIGHT,
  FRAMES_PER_SECOND,
} from './constants'

const {
  max,
  min,
} = Math

export default () => {
  const cannon = {
    x: MIDDLE - CANNON_WIDTH / 2,
    y: 0,
    vx: 0,
    vy: 0
  }

  const projectiles = []

  const initialState = {
    cannon,
    projectiles,
  }

  const update = (state, [key, Δ]) => {
    return [
      move(key),
      createProjectiles(key),
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

  const createProjectiles = (key) => (state) => {
    if (key.y > 0 && state.projectiles.length < 2) {
      return {
        ...state,
        projectiles: state.projectiles.concat({
          y: CANNON_HEIGHT,
          x: state.cannon.x + CANNON_WIDTH / 2,
        })
      }
    } else {
      return state
    }
  }

  const physics = (Δ) => (state) => {
    const projectiles = state.projectiles.reduce((ps, {x, y}) => {
      const newY = y + 20
      if (newY > HEIGHT) {
        return ps
      } else {
        return ps.concat({ x, y: newY })
      }
    }, [])

    const cannon = {
      ...state.cannon,
      x: min(max(0, state.cannon.x + Δ * state.cannon.vx), window.innerWidth - 50),
    }

    return {
      ...state,
      cannon,
      projectiles,
    }
  }

  const view = ([[windowWidth, windowHeight], {cannon, projectiles}]) =>
    <div className={`game`} style={`width: ${windowWidth}px; height: ${windowHeight}px`}>
      <div className={`cannon`} style={`left: ${cannon.x}px; bottom: ${cannon.y}px`}></div>
      {projectiles.map(({x, y}) =>
          <div className={`projectile`} style={{ left: `${x}px`, bottom: `${y}px` }}></div>)}
    </div>

  const delta = fps(FRAMES_PER_SECOND).map((t) => t / 20)

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
