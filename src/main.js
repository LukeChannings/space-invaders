import {
  create,
  diff,
  patch,
} from 'virtual-dom'

import model$ from './model'
import view from './view'

const vdom$ = model$.map(view)
model$.log(`model$`)

vdom$
  .take(1)
  .onValue((initialTree) => {
    const rootNode = create(initialTree)

    document.querySelector(`.app`).appendChild(rootNode)

    vdom$
      .diff(diff)
      .onValue((newTree) => patch(rootNode, newTree))
  })
