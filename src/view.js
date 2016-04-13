import {
  h,
} from 'virtual-dom'

import styles from './view.css'

const projectile = ({width, height}) => ({x, y, id}) => {
  const projectileX =
    `${x / 100} * ${width}px`
  const projectileY =
    `${styles.cannonHeight} + (${y / 100} * (${height}px - ${styles.cannonHeight}))`

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

export default function view ({ dimensions, cannon, projectiles = [] }) {
  const cannonX = `${cannon.x / 100} * (${dimensions.width}px - ${styles.cannonWidth})`

  return (
    <div className={styles.game}>
      <div
        className={styles.cannon}
        style={{transform: `translateX(calc(${cannonX}))`}}>
      </div>
      { projectile(dimensions)({x: 50, y: 0, id: `foo`}) }
      { projectiles.map(projectile(dimensions)) }
    </div>
  )
}
