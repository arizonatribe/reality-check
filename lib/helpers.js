/* eslint-disable no-console */
const chalk = require('chalk')
const fm = require('file-matcher')
const { EventEmitter } = require('events')
const isEqual = require('vanillas/isEqual')

const emitter = new EventEmitter()

function allTestsReturnSameValue(tests = []) {
  let messages
  tests.map(([caption, benchmarkTest, ...args]) => [caption, benchmarkTest(...args)])
    .every(([caption, result], index, arr) => {
      if (!isEqual(result, arr[0][1])) {
        messages = chalk`{red The result for ${
          index > 1 ? caption : 'the second test'
        } }{red doesn't match the first test:}`
        messages += chalk`{green \n  ${JSON.stringify(arr[0][1])}}{yellow \n    vs}{green \n  ${JSON.stringify(result)}\n}`
        return false
      }
      return true
    })
  return messages
}

function errorLog(...args) {
  console.error(...args.map(arg => chalk`{red ${String(arg)}}`))
}

function log(...args) {
  console.log(
    ...args.map(arg => chalk`{yellow.bold ${String(arg)}}`
      .replace(/".*"/g, s => chalk`{red "}{cyan.bold ${s.slice(1, s.length - 1)}}{red.bold "}{white }`)
      .replace(/(\s){1}(x){1}(\s){1}/g, s => chalk`{white }{red.bold ${s}}{white }`)
      .replace(/Fastest is/i, s => chalk`🚀 {white }{green ${s}}{white }`)
      .replace(/±[0-9.]+%/g, s => chalk`{white }{yellow ${s}}{white }`)
      .replace(/[0-9,]+ ops\/sec/,
        s => chalk`{white }{yellow ${s.split(' ')[0]}} {white ${s.split(' ')[1]}}`
      )
    )
  )
}

function createLogger() {
  let testIndex = 0
  let opts = {}
  return {
    log,
    init({useTap, prettyPrint, functionNames}) {
      opts = { useTap, prettyPrint }
      if (useTap) console.log('TAP version 13')

      emitter.on('start', message => {
        if (useTap) console.log(`# ${message}`)
        if (prettyPrint) log(message)
      })
      emitter.on('cycle', message => {
        if (useTap) console.log(`ok ${++testIndex} - ${message}`)
        if (prettyPrint) log(message)
      })
      emitter.on('complete', message => {
        if (useTap) console.log(`# 🚀 ${message}`)
        if (prettyPrint) log(message)
      })
      emitter.on('invalid', message => {
        if (useTap) console.error(`not ok ${testIndex} - ${message}`)
        if (prettyPrint) {
          errorLog(message)
          errorLog('The benchmarks may be invalid because one (or more) of the tests return different values')
        }
      })

      if (!functionNames.length) {
        log(chalk`{white Running all tests}{red.bold :}`)
        log(chalk`{cyan You can always specify which test(s) to run using this syntax}:\n`)
        log(chalk`{red $} {yellow benchmark-check }{cyan <file1> <file2> <file3>}{white ...}`)
      } else if (functionNames.length !== 1) {
        log(chalk`{white Running benchmark tests for:\n ${functionNames.join(',\n ')}}{red.bold}\n`)
      }
    },
    close() {
      if (opts.useTap) {
        console.log(
          `1..${testIndex}`,
          `# tests ${testIndex}`,
          `# pass ${testIndex}`,
          '# ok'
        )
      }
    }
  }
}

function findBenchmarkTests(cwd) {
  const matcher = new fm.FileMatcher()
  return matcher.find({
    path: cwd,
    recursiveSearch: true,
    fileFilter: {
      content: /(\s+from\s+|require\()('|")reality-check/,
      fileNamePattern: '!(node_modules)/**/*.js'
    }
  })
}

const logger = createLogger()

module.exports = {
  log,
  logger,
  emitter,
  errorLog,
  findBenchmarkTests,
  allTestsReturnSameValue
}
