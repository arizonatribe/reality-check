# Reality Check

<img
  src="https://raw.githubusercontent.com/arizonatribe/reality-check/master/media/logo.png"
  width=250
  alt="Reality Check"
  align="right"
/>

A unit-test like wrapper around benchmark.js, for testing CPU performance of functions in JavaScript or TypeScript

# Installation

```
npm install reality-check
```

## Focusing on Side-By-Side Tests

The [benchmark.js](https://www.npmjs.com/package/benchmark) is the core engine powering this tool. Benchmark.js is a powerful tool with many hook-ins, statistics and possibilities for creating a benchmark performance report. For the sake of this project, the number of operations-per-second and number-of-times-executed are the basis of the benchmark report.

This project focuses on creating a way to generate that kind of report for side-by-side comparisons of different ways of executing code. As this is a very common reason for running a CPU performance benchmark - comparing "my way" vs "your way" - the whole of Benchmark.js is being reduced down into a format that allows you to see those kinds of side-by-side comparisons.

## Aiming for an API similar to Unit Testing

Unit test frameworks in JavaScript/TypeScript provide us a way to execute chunks of code in an entire run (organized into different test "suites"). This convenience makes it much easier to check the validity of our code. Likewise, this project here aims to provide a "unit test like" wrapper around Benchmark.js and the side-by-side CPU performance comparisons. Writing a benchmark test should therefore remind you of writing unit tests.

# Usage

This project has a CLI component to it and it executes against any file where you've imported/required from `reality-check`.

So in your test file you may have something like this:

```javascript
const { test } = require("reality-check")

test("Squaring each number in a list", benchmark => {
    const unsortedArray = Array(10000)
        .fill(0)
        .map((_, i) => Math.floor(Math.random() * i))

    benchmark(() => {
        const arrCopy = Array(10000)
        unsortedArray.forEach((val, i) => {
            arrCopy[i] = val**2
        })
        return arrCopy
    }, "Array.prototype.forEach")

    benchmark(() => {
        const arrCopy = []
        for (const val of unsortedArray) {
            arrCopy.push(val**2)
        }
        return arrCopy
    }, "for..of")

    benchmark(() => {
        const arrCopy = Array(10000)
        for (let i = 0; i < 10000; i++) {
            arrCopy[i] = unsortedArray[i]**2
        }
        return arrCopy
    }, "for loop")
})
```

Now you can invoke the CLI and it'll find your test and execute it:

```
$ rcheck

Running benchmark test suite: "Squaring each number in a list" . . .

[Array.prototype.forEach]
  - 8,863 ops/sec
  - 1,637 times executed
  - 95 runs sampled
[for..of]
  - 5,755 ops/sec
  - 292 times executed
  - 96 runs sampled
[for loop]
  - 38,975 ops/sec
  - 1,978 times executed
  - 96 runs sampled

⏱ Fastest is for loop 🚀
   - Array.prototype.forEach .... 339.73% slower!
   - for..of .................... 577.21% slower!
```

### Examples

There are a handful of examples in this project's own `test/` directory. Different kinds of sorts are benchmarked, as well as looping mechanisms, adding-to/removing-from arrays, etc.

Also, the [vanillas](https://www.github.com/arizonatribe/vanillas) utils library makes heavy use of `reality-check` inside of its `test/benchmarks/` directory. That project compares to popular libraries like Lodash, Ramda, FxJs, etc., and so its benchmark tests are there to demonstrate how its own util functions perform in comparison to similar util functions in Lodash, Ramda, etc. So there are many more examples on how to use `reality-check` you can find there.

### Glob Filtering Tests

You can specify any glob pattern you wish to use to filter tests:

```
$ rcheck *.benchmark-test.js benchmarks/
```

Otherwise, this tool will look for and run any file importing from the `reality-check` library starting from the cwd.

### Additional CLI Options

And, these are some additional _named_ CLI options:

*  `--require` - One or more commonjs modules to import prior to running the test
*  `--debug` - Turn on debug logging (for troubleshooting the script itself)
*  `--cwd` - Optional base directory from which to search for benchmark tests (defaults to `process.cwd()`)

## Each Test Must Return the Same Value

When benchmarking, if a function errors out it'll look like it ran faster than other functions being benchmarked. A lot of time can be wasted if you're not aware of this problem. To mitigate this issue, this project ensures that every function being benchmarked returns the same value.

When writing a test around a function which does not return a value, consider wrapping it so that the result of each function produces a value. The example listed in the [Usage](#usage) section demonstrates this around a test of a forEach/for/for..of loop.
