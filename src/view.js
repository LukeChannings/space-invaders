import {
  h,
} from 'virtual-dom'

export default function view ({cannonPosition}) {
  return (
    <div
      className={`cannon`}
      style={{left: `calc(((100% - 50px) / 100 ) * ${cannonPosition})`}}>
    </div>
  )
}
