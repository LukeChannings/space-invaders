import {
  h,
} from 'virtual-dom'

import styles, {
  cannonWidth,
  cannonHeight,
  invaderWidth,
  invaderHeight,
} from './view.css'

const Projectile = ({width, height}) => ({x, y, id}) => {
  const cannonWidth_ = parseInt(cannonWidth, 10)
  const cannonHeight_ = parseInt(cannonHeight, 10)

  const projectileX =
    `${cannonWidth_ / 2}px + (${x / 100} * (${width}px - ${cannonWidth_}px))`
  const projectileY =
    `${height}px - (${cannonHeight_}px + (${y / 100} * ${height - cannonHeight_}px))`

  return (
    <div
      key={id}
      className={styles.projectile}
      style={{
        transform: `translate(calc(${projectileX}), calc(${projectileY}))`
      }}>
    </div>
  )
}

const Invader = ({width, height}) => ({type, x, y}) => {
  return (
    <div
      className={styles[`invaderType${type}`]}
      style={{
        left: `${width * (x / 100)}px`,
        bottom: `${(height - parseInt(invaderHeight, 10)) * (y / 100)}px`,
      }}></div>)
}

export default function view ({ dimensions, cannon, cannonProjectiles = [], invaders }) {
  const cannonX = `${cannon.x / 100} * (${dimensions.width}px - ${cannonWidth})`
  const gameOver = invaders.length === 0
  return (
    <div className={styles.game}>
      <div
        className={styles.cannon}
        style={{transform: `translateX(calc(${cannonX}))`}}>
      </div>
      { cannonProjectiles.map(Projectile(dimensions)) }
      { invaders.map(Invader(dimensions)) }
      {gameOver ? <h1 className={styles.gameOver}>Game Over</h1> : null}
    </div>
  )
}
