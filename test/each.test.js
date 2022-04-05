const { test } = require("../lib")
// const { test } = require("reality-check")

test("Each", bench => {
    const unsortedArray = Array(10000)
        .fill(0)
        .map((_, i) => Math.floor(Math.random() * i))

    bench(() => {
        const arrCopy = Array(10000)
        unsortedArray.forEach((val, i) => {
            arrCopy[i] = val**2
        })
        return arrCopy
    }, "Array.prototype.forEach")

    bench(() => {
        const arrCopy = []
        for (const val of unsortedArray) {
            arrCopy.push(val**2)
        }
        return arrCopy
    }, "for..of")

    bench(() => {
        const arrCopy = Array(10000)
        for (let i = 0; i < 10000; i++) {
            arrCopy[i] = unsortedArray[i]**2
        }
        return arrCopy
    }, "for loop")
})
