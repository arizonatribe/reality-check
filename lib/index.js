const Benchmark = require('benchmark')
const { allTestsReturnSameValue, emitter } = require('./helpers')

function createSuite(caption, fn, cb) {
  return fn(
    new Benchmark.Suite(caption || '(anonymous)', {
      onCycle(event) {
        if (event) {
          emitter.emit('cycle', event.target)
        }
      },
      onComplete() {
        const fastest = this.filter('fastest').map('name')
        emitter.emit('complete', `Fastest is ${fastest}\n`)
        if (typeof cb === 'function') cb(fastest)
      },
      onStart() {
        const tests = this.slice(0).map(s => [s.name, s.fn])
        const testsReturnDifferentValues = allTestsReturnSameValue(tests)
        if (testsReturnDifferentValues) {
          emitter.emit('invalid', testsReturnDifferentValues)
          this.abort()
        } else {
          emitter.emit('start', `${caption || 'Starting benchmark tests. . .'}\n`)
        }
      }
    })
  )
}

module.exports = createSuite
