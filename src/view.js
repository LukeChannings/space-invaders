import {
  h,
} from 'virtual-dom'

import styles from './view.css'

const projectile = ({width, height}) => ({x, y, id}) => {
  const cannonWidth = parseInt(styles.cannonWidth, 10)
  const cannonHeight = parseInt(styles.cannonHeight, 10)

  const projectileX =
    `${cannonWidth / 2}px + (${x / 100} * (${width}px - ${cannonWidth}px))`
  const projectileY =
    `${height}px - (${cannonHeight}px + (${y / 100} * ${height - cannonHeight}px))`

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

export default function view ({ dimensions, cannon, cannonProjectiles = [] }) {
  const cannonX = `${cannon.x / 100} * (${dimensions.width}px - ${styles.cannonWidth})`

  return (
    <div className={styles.game}>
      <div
        className={styles.cannon}
        style={{transform: `translateX(calc(${cannonX}))`}}>
      </div>
      { cannonProjectiles.map(projectile(dimensions)) }
    </div>
  )
}
