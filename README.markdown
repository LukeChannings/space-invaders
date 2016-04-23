# Space Invaders

This is a project to explore the concept of Functional Reactive Programming (FRP) as much as possible in JavaScript.

## Choice of FRP library

The libraries available in JavaScript at this time are not mature, but neither is FRP in general.
This project's initial implementation will be in [Kefir](https://rpominov.github.io/kefir/), which is almost the same as [BaconJS](https://baconjs.github.io), but faster (in simple terms).

Whilst [RxJS](https://github.com/Reactive-Extensions/RxJS) has significant overlap with Kefir and BaconJS it is not considered FRP, and is as such unfit for the purposes of this project. It does however have many abstractions and layers that would possibly simplify some of the logic in this application, and may warrant investigation in the future.

A library called [flyd](https://github.com/paldepind/flyd) also looks very exciting, and I will most likely attempt an implementation in flyd after Kefir.

## Lessons Learnt

- Many streams with timers causes large performance issues, a single timer that is filtered/mapped is much faster.
- Streams all end up combined to be mapped to a view, the streams need to be properties at this point otherwise the stream with no value will block everything else.
- Making a stream to represent two things e.g. Left AND Right arrow presses is probably a bad idea and will cause awkward behaviour. Create two streams and merge them instead.
- JavaScript does not allow mutually recursive definitions (to creating a triangle dependency), to create a triangle shaped group of streams a `pool` must be created, consumed, and the stream added to the pool after the dependents have subscribed. Other implementations like [Sodium](https://github.com/SodiumFRP/sodium) abstract the pooling technique
- A current limitation (possibly just of Kefir) is that all streams must be `Properties` (streams with an initial value, simply). This is because when many streams are merged the resulting stream will not have any values until all the streams it is comprised of have a value.


## Resources

- [Stephen Blackheath's FRP book](https://www.manning.com/books/functional-reactive-programming)
- [Elm examples](http://elm-lang.org/examples)
- [EFRP (Elm's flavour of FRP, similar to Flux / Redux architecture)](http://haskell.cs.yale.edu/wp-content/uploads/2011/02/efrp.pdf)
- [Conal Elliot's talk on Push-Pull FRP](https://vimeo.com/6686570)
- [Animated letters CycleJS example is useful for understanding how streams are created and destroyed](https://github.com/cyclejs/examples/blob/master/animated-letters/src/main.js)
