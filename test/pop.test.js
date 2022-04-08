import { test } from "reality-check"

const largeList = Array(10000)
  .fill(0)
  .map((_, i) => Math.floor(Math.random() * (10000 + i)))

test("pop", benchmark => {
  benchmark(
    () => {
    // Have to copy it to make the .pop() test afterwards fair
      const arrCopy = [...largeList]
      return arrCopy[arrCopy.length - 1]
    },
    "reference last item in an array (by index)"
  )
  benchmark(
    () => {
      const arrCopy = [...largeList]
      return arrCopy.pop()
    },
    "pop() the last item out of an array"
  )
  benchmark(
    () => {
      const arrCopy = [...largeList]
      return arrCopy.splice(-1)[0]
    },
    "splice() the last item from an array"
  )
  benchmark(
    () => {
      const arrCopy = [...largeList]
      return arrCopy.slice(-1)[0]
    },
    "slice() the last item from an array"
  )
})
