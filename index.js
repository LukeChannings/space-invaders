import {
  create,
  diff,
  patch,
} from 'virtual-dom'

import vtree$ from './src/main'

const app = document.querySelector(`.app`)
let rootNode, prevTree

vtree$.onValue((vtree) => {
  if (!rootNode) {
    rootNode = create(vtree)
    app.appendChild(rootNode)
  } else {
    const newTree = diff(prevTree, vtree)
    window.requestAnimationFrame(() => patch(rootNode, newTree))
  }

  prevTree = vtree
})
