const Benchmark = require('benchmark')
const { allTestsReturnSameValue, log } = require('./helpers')

function createSuite(caption, fn, logger = log) {
  return fn(
    new Benchmark.Suite(caption, {
      onCycle(event) {
        if (event) logger(String(event.target))
      },
      onComplete() {
        logger(`Fastest is ${this.filter('fastest').map('name')}\n`)
      },
      onStart() {
        const tests = this.slice(0).map(s => [s.name, s.fn])
        const testsReturnDifferentValues = allTestsReturnSameValue(tests)
        if (testsReturnDifferentValues) {
          logger(testsReturnDifferentValues)
          throw new Error('Unable to run benchmarks because one (or more) of the tests return different values')
        }
        logger(`${caption || 'Starting benchmark tests. . .'}\n`)
      }
    })
  )
}

module.exports = createSuite
