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
  WIDTH,
  MIDDLE,
  CANNON_WIDTH,
  CANNON_HEIGHT,
  FRAMES_PER_SECOND,
} from './constants'

const {
  max,
  min,
  floor,
  ceil,
} = Math

export default (persistedState) => {
  const cannon = {
    x: MIDDLE - CANNON_WIDTH / 2,
    y: 0,
    vx: 0,
    vy: 0
  }

  const projectiles = []

  const invaderRows = Array.from({length: 5}).map((_, rowIndex) => {
    return Array.from({length: 11}).map((_, i) => {
      const step = (WIDTH * 0.8) / 11
      const padding = (WIDTH * 0.1)
      const type = [
        `small`,
        `medium`,
        `medium`,
        `large`,
        `large`,
      ][rowIndex]
      return {
        x: padding + step * i,
        y: HEIGHT - (100 + (rowIndex * 100)),
        dir: `right`,
        type,
      }
    })
  })

  const initialState = persistedState || {
    cannon,
    projectiles,
    invaderRows,
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

    const invaderRows = state.invaderRows.map((invaderRow) => {
      const sampleInvader = invaderRow[invaderRow.length - 1]
      const x = sampleInvader.dir === `right`
        ? min(WIDTH - 70, ceil(sampleInvader.x + Δ))
        : max(0, floor(sampleInvader.x - Δ))
      const dir =
          x === WIDTH - 70 ? `left`
        : x === 0 ? `right`
        : sampleInvader.dir
      const y = sampleInvader.dir !== dir ? sampleInvader.y - 100 : sampleInvader.y
      return invaderRow.reduceRight((res, invader) => {
        const x = dir === `right`
          ? min(WIDTH - 70, ceil(invader.x + Δ))
          : max(0, floor(invader.x - Δ))

        return res.concat({
          ...invader,
          x,
          y,
          dir,
        })
      }, [])
    })

    return {
      ...state,
      cannon,
      projectiles,
      invaderRows,
    }
  }

  const view = ([[windowWidth, windowHeight], {cannon, projectiles, invaderRows}]) =>
    <div className={`game`} style={`width: ${windowWidth}px; height: ${windowHeight}px`}>
      {invaderRows.map((invaders, i) =>
        <div className={`invaders`} key={i}>
          {invaders.map((invader, i) => <div key={i} className={`invader invader--${invader.type}`} style={{left: `${invader.x}px`, bottom: `${invader.y}px`}}></div>)}
        </div>)}
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

  model$.onValue((model) => {
    global.row = model.invaderRows[model.invaderRows.length - 1]
  })

  return {
    default: combine([ dimension$, model$ ]).map(view),
    model$,
  }
}
