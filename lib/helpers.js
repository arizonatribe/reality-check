const chalk = require('chalk')
const fm = require('file-matcher')
const isEqual = require('vanillas/isEqual').default
const readdirRecursive = require('fs-readdir-recursive')

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
  // eslint-disable-next-line no-console
  console.error(...args.map(arg => chalk`{red ${String(arg)}}`))
}

function log(...args) {
  // eslint-disable-next-line no-console
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

function selectedBenchmarksOrAllofThem(functionNames = [], baseDir) {
  if (!functionNames.length && baseDir) {
    return readdirRecursive(baseDir).map(fn => fn.split('.')[0])
  }
  return functionNames
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

module.exports = {
  log,
  errorLog,
  findBenchmarkTests,
  allTestsReturnSameValue,
  selectedBenchmarksOrAllofThem
}
