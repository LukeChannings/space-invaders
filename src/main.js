import {
  create,
  diff,
  patch,
} from 'virtual-dom'

import model$ from './model'
import view from './view'

const vtree$ = model$.map(view)

// side-effects 😱

const app = document.querySelector(`.app`)
let rootNode, prevTree

vtree$.onValue((vtree) => {
  if (!rootNode) {
    rootNode = create(vtree)
    app.appendChild(rootNode)
  } else {
    const newTree = diff(prevTree, vtree)
    patch(rootNode, newTree)
  }

  prevTree = vtree
})
