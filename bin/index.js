const path = require('path')
const chalk = require('chalk')
const parseCli = require('minimist')
const resolveSync = require('resolve').sync
const { findBenchmarkTests, errorLog, log } = require('../lib/helpers')

const parsed = parseCli(process.argv.slice(2), {
  alias: { r: 'require' },
  string: 'requires',
  boolean: 'update-docs',
  default: { r: ['@babel/register'] }
})

const requires = Array.from(new Set([...parsed.require, ...parsed.r]))
if (requires.length) {
  // eslint-disable-next-line import/no-dynamic-require
  requires.filter(Boolean).forEach(mod => { require(resolveSync(mod)) })
}

const functionNames = parsed._

// eslint-disable-next-line no-void
void (async function benchmark() {
  try {
    let benchmarkTests = []
    if (!functionNames.length) {
      log(chalk`{white Running all tests}{red.bold :}`)
      log(chalk`{cyan You can always specify which test(s) to run using this syntax}:\n`)
      log(chalk`{red $} {yellow npm run benchmark }{white -- }{cyan <file1> <file2> <file3>}{white ...}`)
      log(chalk`{cyan (You can run one or more or all of the tests in the }{red benchmark/test/} {cyan directory)}\n`)
      benchmarkTests = await findBenchmarkTests(process.cwd())
    } else if (functionNames.length !== 1) {
      log(chalk`{white Running benchmark tests for: "${functionNames.join(', ')}"}{red.bold  . . . }\n`)
      benchmarkTests = functionNames.map(fnName => path.resolve(fnName))
    }

    // eslint-disable-next-line import/no-dynamic-require
    benchmarkTests.forEach(filePath => { require(filePath) })
    process.exit(0)
  } catch (err) {
    errorLog(err)
    process.exit(1)
  }
}())
