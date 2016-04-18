import {
  create,
  diff,
  patch,
} from 'virtual-dom'

import model$ from './model'
import view from './view'

model$
  .map(view)
  .scan(([appNode, currentTree, patches], nextTree) =>
    !appNode
      ? [create(nextTree), nextTree]
      : [appNode, nextTree, diff(currentTree, nextTree)], [])
  .onValue((app) => {
    if (!app[0].parentNode) {
      document.body.appendChild(app[0])
    } else if (app[2]) {
      patch(app[0], app[2])
    }
  })
