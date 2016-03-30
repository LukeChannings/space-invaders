import {
  interval,
} from 'kefir'

export const fps = (frames) =>
  interval(1000 / frames)
    .map(() => Number(new Date))
