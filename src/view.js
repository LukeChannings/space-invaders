import {
  h,
} from 'virtual-dom'

import styles from './view.css'

const projectile = ({width, height}) => ({x, y, id}) =>
  <div
    key={id}
    className={styles.projectile}
    style={{
      left: `${width * (x / 100)}px`,
      bottom: `${y < 100 ? 40 + height * (y / 100) : null}px`,
    }}>
  </div>

export default function view ({ dimensions, cannon, projectiles = [] }) {
  return (
    <div className={styles.game}>
      <div
        className={styles.cannon}
        style={{left: `${(dimensions.width - 50) * (cannon.x / 100)}px`}}>
      </div>
      { projectiles.map(projectile(dimensions)) }
    </div>
  )
}
