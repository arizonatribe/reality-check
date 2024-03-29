/* eslint-disable jsdoc/require-jsdoc */
const { test } = require("../lib")
// const { test } = require("reality-check")

function heapify(arr, chunkLength, idx) {
  let indexOfLargest = idx
  const leftIndex = idx * 2 + 1
  const rightIndex = leftIndex + 1

  if (leftIndex < chunkLength && arr[leftIndex] > arr[indexOfLargest]) {
    indexOfLargest = leftIndex
  }

  if (rightIndex < chunkLength && arr[rightIndex] > arr[indexOfLargest]) {
    indexOfLargest = rightIndex
  }

  if (indexOfLargest !== idx) {
    [arr[idx], arr[indexOfLargest]] = [arr[indexOfLargest], arr[idx]]
    heapify(arr, chunkLength, indexOfLargest)
  }

  return arr
}

function heapsort(arr) {
  const len = arr.length
  let a = Math.floor(len / 2 - 1)
  let b = len - 1

  while (a >= 0) {
    if (a * 2 < len) {
      heapify(arr, len, a)
    }
    a--
  }

  while (b >= 0) {
    [arr[0], arr[b]] = [arr[b], arr[0]]
    heapify(arr, b, 0)
    b--
  }

  return arr
}

function concatlists(arr1, arr2, arr3) {
  const merged = Array(arr1.length + arr2.length + arr3.length)

  let nextAvailableIndex = 0

  for (let i = 0, len = arr1.length; i < len; i++) {
    merged[nextAvailableIndex] = arr1[i]
    nextAvailableIndex++
  }

  for (let i = 0, len = arr2.length; i < len; i++) {
    merged[nextAvailableIndex] = arr2[i]
    nextAvailableIndex++
  }

  for (let i = 0, len = arr3.length; i < len; i++) {
    merged[nextAvailableIndex] = arr3[i]
    nextAvailableIndex++
  }

  return merged
}

/**
 * @param arr
 */
function quicksort(arr) {
  const len = arr.length

  if (len <= 1) {
    return arr
  }

  const pivot = arr[len - 1]

  const itemsLower = []
  const itemsHigher = []
  const sortedItems = []

  for (let i = 0; i < len; i++) {
    const item = arr[i]

    if (item < pivot) {
      itemsLower.push(item)
    } else if (item > pivot) {
      itemsHigher.push(item)
    } else {
      sortedItems.push(item)
    }
  }

  return concatlists(
    itemsLower.length > 0 ? quicksort(itemsLower) : [],
    sortedItems,
    itemsHigher.length > 0 ? quicksort(itemsHigher) : []
  )
}

function bubblesort(arr) {
  for (let i = 0, len = arr.length; i < len; i++) {
    for (let j = 0; j < len; j++) {
      if (arr[i] < arr[j]) {
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
    }
  }

  return arr
}

function insertionsort(arr) {
  for (let i = 0, len = arr.length; i < len; i++) {
    let idx = i
    while (idx > 0 && arr[idx] < arr[idx - 1]) {
      [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]]
      idx--
    }
  }

  return arr
}

function mergelists(leftList, rightList) {
  const leftLen = leftList.length
  const rightLen = rightList.length

  const merged = Array(leftLen + rightLen)

  let currentLeftIndex = 0
  let currentRightIndex = 0

  while (currentLeftIndex < leftLen && currentRightIndex < rightLen) {
    if (leftList[currentLeftIndex] > rightList[currentRightIndex]) {
      merged[currentLeftIndex + currentRightIndex] = rightList[currentRightIndex]
      currentRightIndex++
    } else {
      merged[currentLeftIndex + currentRightIndex] = leftList[currentLeftIndex]
      currentLeftIndex++
    }
  }

  while (currentLeftIndex < leftLen) {
    merged[currentLeftIndex + currentRightIndex] = leftList[currentLeftIndex]
    currentLeftIndex++
  }

  while (currentRightIndex < rightLen) {
    merged[currentLeftIndex + currentRightIndex] = rightList[currentRightIndex]
    currentRightIndex++
  }

  return merged
}

function mergesort(arr) {
  const len = arr.length

  if (len <= 1) {
    return arr
  }

  const midpointIndex = Math.floor(len / 2)

  return mergelists(
    mergesort(arr.slice(0, midpointIndex)),
    mergesort(arr.slice(midpointIndex, len))
  )
}

function radixsort(arr) {
  const len = arr.length
  const maxNumOfDigits = `${Math.max(...arr)}`.length

  for (let i = 1; i <= maxNumOfDigits; i++) {
    const buckets = []

    for (let c = 0; c < 10; c++) {
      buckets[c] = []
    }

    for (let j = 0; j < len; j++) {
      const strNum = `${arr[j]}`
      const digitIdx = +strNum[strNum.length - i] || 0
      buckets[digitIdx].push(arr[j])
    }

    let nextIdx = 0

    for (let a = 0; a < 10; a++) {
      for (let b = 0, bucketLen = buckets[a].length; b < bucketLen; b++) {
        arr[nextIdx] = buckets[a][b]
        nextIdx++
      }
    }
  }

  return arr
}

function selectionsort(arr) {
  const len = arr.length
  let startingIdx = 0

  while (startingIdx < len) {
    let idxOfMinVal = startingIdx
    for (let i = startingIdx; i < len; i++) {
      if (arr[i] < arr[idxOfMinVal]) {
        idxOfMinVal = i
      }
    }

    if (idxOfMinVal !== startingIdx) {
      [arr[idxOfMinVal], arr[startingIdx]] = [arr[startingIdx], arr[idxOfMinVal]]
    }
    startingIdx++
  }

  return arr
}

test("Sorts", bench => {
  const unsortedArray = Array(10000)
    .fill(0)
    .map((_, i) => Math.floor(Math.random() * i))

  bench(() => {
    const arrCopy = [...unsortedArray]
    heapsort(arrCopy)
    return arrCopy
  }, "heap sort")

  bench(() => {
    const arrCopy = [...unsortedArray]
    return quicksort(arrCopy)
  }, "quick sort")

  bench(() => {
    const arrCopy = [...unsortedArray]
    return selectionsort(arrCopy)
  }, "selection sort")

  bench(() => {
    const arrCopy = [...unsortedArray]
    return insertionsort(arrCopy)
  }, "insertion sort")

  bench(() => {
    const arrCopy = [...unsortedArray]
    bubblesort(arrCopy)
    return arrCopy
  }, "bubble sort")

  bench(() => {
    const arrCopy = [...unsortedArray]
    return mergesort(arrCopy)
  }, "merge sort")

  bench(() => {
    const arrCopy = [...unsortedArray]
    radixsort(arrCopy)
    return arrCopy
  }, "radix sort")
})
