import {
  create,
  diff,
  patch,
} from 'virtual-dom'

import main from './src/main'

const persistedState =
  global.localStorage.game
    ? JSON.parse(global.localStorage.game)
    : null

const {
  default: vtree$,
  model$,
} = main(persistedState)

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

// persistence
global.save = () => {
  model$.take(1).onValue((model) => {
    global.localStorage.game = JSON.stringify(model)
  })
}
