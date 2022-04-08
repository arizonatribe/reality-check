/* eslint-disable jsdoc/require-jsdoc */
// const { test } = require("reality-check")
const { test } = require("../lib")

function bubblesortReverse(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
    }
  }
  return arr
}

function bubblesort(arr) {
  for (let i = 0, len = arr.length; i < len; i++) {
    for (let j = 0; j < len; j++) {
      if (arr[j] > arr[i]) {
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
    }
  }
  return arr
}

test("two different kinds of bubble sort", benchmark => {
  const arr = Array(10000).fill(0).map((_, i) => Math.floor(Math.random() * (i + 10000)))

  benchmark(
    () => {
      const arrCopy = [...arr]
      bubblesortReverse(arrCopy)
      return arrCopy
    },
    "Shrink the size of the loop (starting from the end) at each pass"
  )
  benchmark(
    () => {
      const arrCopy = [...arr]
      bubblesort(arrCopy)
      return arrCopy
    },
    "Loop through the array beginning to end for each index"
  )
})
