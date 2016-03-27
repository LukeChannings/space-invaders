import {
  create,
  diff,
  patch,
  h,
} from 'virtual-dom'

const view = ({cannonPosition}) =>
  <div
    className={`cannon`}
    style={{left: `calc(((100% - 50px) / 100 ) * ${cannonPosition})`}}>
  </div>

export default function (model$) {
  const app = model$.map(view)
  let rootNode

  app
    .diff(diff)
    .onValue((newTree) => patch(rootNode, newTree))

  // side-effects 😬

  app
    .take(1)
    .onValue((initialTree) => {
      rootNode = create(initialTree)
      document.querySelector(`.app`).appendChild(rootNode)
    })
}
