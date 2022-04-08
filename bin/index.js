#! /usr/bin/env node
/* eslint-disable global-require, import/no-dynamic-require */

const path = require("path")
const logger = require("@vanillas/chalk-console-logger")
const { parseArgs, resolvePathIfExists } = require("@vanillas/cli-toolkit")

const {
  toStringArray,
  toAbsolutePath,
  findBenchmarkTests,
  resolveGlobbedFiles
} = require("../lib/helpers")


/**
 * Runs CPU performance benchmarks on JavaScript/TypeScript functions
 *
 * @async
 * @function
 * @name runBenchmarkTests
 */
async function runBenchmarkTests() {
  const options = parseArgs(process.argv.slice(2))

  if (options.h || options.help || options.Help) {
    /* eslint-disable max-len */
    logger.info(chalk => chalk`
{bold.cyan Run CPU performance 🕐 benchmarks on JavaScript/TypeScript functions}

{bold.green Options:}
  {bold.yellow --require}        {white One or more commonjs modules to import }{bold.white prior }{white to running the test}
  {bold.yellow --debug}          {white Turn on debug logging (for troubleshooting the script itself)}
  {bold.yellow --cwd}            {white Optional base directory from which to search for benchmark tests (defaults to }{cyan process.cwd()}{white )}

{bold.green Examples:}
  $ {cyan rcheck }{red sorts.test.js **/*.benchmarks.js}
  $ {cyan rcheck }{yellow --require }{red ts-node/register}
  $ {cyan rcheck }{yellow --cwd }{red test/benchmark-tests/}
`)
    /* eslint-enable max-len */
    process.exit(0)
  }

  logger.setLevel((options.debug || options.d) ? "debug" : "info")

  logger.debug(options)

  try {
    const cwd = options.cwd
      ? options.cwd
      : process.cwd()

    if (!resolvePathIfExists(cwd)) {
      throw new Error(`Invalid base directory to search for tests: '${
        JSON.stringify(cwd)
      }'`)
    }

    const requireModules = [
      ...toStringArray(options.require),
      ...toStringArray(options.r)
    ]

    /* Require/Import any modules which the user specified
     * (ie, @babel/register, ts-node/register)
     */
    for (let i = 0, len = requireModules.length; i < len; i++) {
      const modPath = toAbsolutePath(requireModules[i])
      require(modPath)
    }

    let benchmarkTests = []
    const filterPatterns = toStringArray(options._)

    /* Any user-specified glob? */
    if (filterPatterns.length) {
      const resolvedGlobs = resolveGlobbedFiles(filterPatterns, cwd)

      logger.debug({ globs: filterPatterns, resolvedGlobs })

      benchmarkTests = resolvedGlobs.length
        ? resolvedGlobs
        : findBenchmarkTests(cwd, filterPatterns)
    } else {
      /* Otherwise look for every file (from the cwd) which imports from this lib */
      benchmarkTests = findBenchmarkTests(cwd, ["\.(jsx?|tsx?|flow|re)$"])
    }

    if (!benchmarkTests.length) {
      if (filterPatterns.length) {
        throw new Error(`No benchmark test files matched the pattern: '${
          filterPatterns.join(" ")
        }'`)
      }

      throw new Error(`No benchmark tests were found${
        options.cwd ? ` at '${options.cwd}'` : ""
      }!`)
    }

    logger.debug({ benchmarkTests })

    logger.info(chalk => chalk`{cyan Found }{red ${
      benchmarkTests.length
    } }{cyan benchmark tests }🕐{yellow ${
      benchmarkTests.map(filePath => `\n  - ${filePath.split(path.sep).pop()}`)
    }}`)

    for (let i = 0, len = benchmarkTests.length; i < len; i++) {
      require(benchmarkTests[i])
    }
  } catch (err) {
    logger.fatal(err)
    process.exit(1)
  }
}

runBenchmarkTests()
