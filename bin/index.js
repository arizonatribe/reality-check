#! /usr/bin/env node

const glob = require('glob')
const parseCli = require('minimist')
const resolveCwd = require('resolve-cwd')
const buildOptions = require('minimist-options')
const { findBenchmarkTests, errorLog, logger } = require('../lib/helpers')

const options = buildOptions({
  tap: {
    default: false,
    type: 'boolean'
  },
  pretty: {
    default: false,
    type: 'boolean'
  },
  require: {
    alias: 'r',
    default: '',
    type: 'string'
  }
})

const {
  r,
  tap: useTap,
  _: functionNames,
  require: requires,
  pretty: prettyPrint
} = parseCli(process.argv.slice(2), options)

/* Require in any modules that the user specified (ie, @babel/register) */
Array
  .from(new Set([...requires.split(','), ...r.split(',')]))
  .filter(Boolean)
  .forEach(mod => { require(resolveCwd(mod)) })

// eslint-disable-next-line no-void
void (async function benchmark() {
  try {
    logger.init({useTap, prettyPrint, functionNames})
    let benchmarkTests = []
    if (!functionNames.length) {
      benchmarkTests = await findBenchmarkTests(process.cwd())
    } else {
      benchmarkTests = glob.sync(functionNames, {
        dot: false,
        cwd: process.cwd(),
        ignore: ['**/node_modules']
      })
    }
    benchmarkTests.forEach(filePath => { require(filePath) })
    logger.close()
    process.exit(0)
  } catch (err) {
    errorLog(err)
    process.exit(1)
  }
}())
