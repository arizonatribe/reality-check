import { test } from "reality-check"

const largeList = Array(10000)
  .fill(0)
  .map((_, i) => Math.floor(Math.random() * (10000 + i)))

test("shift", benchmark => {
  benchmark(
    () => {
      // Have to copy it to make the .shift() test afterwards fair
      const arrCopy = [...largeList]
      return arrCopy[0]
    },
    "reference first item in an array (by index)"
  )
  benchmark(
    () => {
      const arrCopy = [...largeList]
      return arrCopy.shift()
    },
    "shift() the first item out of an array"
  )
  benchmark(
    () => {
      const arrCopy = [...largeList]
      return arrCopy.splice(0, 1)[0]
    },
    "splice() the first item from an array"
  )
  benchmark(
    () => {
      const arrCopy = [...largeList]
      return arrCopy.slice(0, 1)[0]
    },
    "slice() the first item from an array"
  )
})
