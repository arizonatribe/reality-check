#! /usr/bin/env node

const logger = require('@vanillas/chalk-console-logger')
const {
    parseArgs,
    resolveGlobIfExists,
    resolvePathIfExists
} = require('@vanillas/cli-toolkit')

const {
    toStringArray,
    toAbsolutePath,
    findBenchmarkTests,
} = require('../lib/helpers')


async function runBenchmarkTests() {
    const options = parseArgs(process.argv.slice(2))

    if (options.h || options.help || options.Help) {
        logger.info(`
{bold.green Run CPU performance benchmarks on JavaScript/TypeScript functions}

{bold.green Options:}
  {bold.yellow --require}        {white One or more commonjs modules to import }{bold.white prior }{white to running the test}
  {bold.yellow --debug}          {white Turn on debug logging (for troubleshooting the script itself)}
  {bold.yellow --cwd}            {white Optional base directory from which to search for benchmark tests (defaults to }{cyan process.cwd()}{white )}

{bold.green Examples:}
  $ rcheck --require ts-node/register
  $ rcheck --cwd test/benchmark-tests/
`
        )
        process.exit(0)
    }

    logger.setLevel((options.debug || options.d) ? "debug" : "info")

    logger.debug(options)

    try {
        const cwd = options.cwd
            ? options.cwd
            : process.cwd()

        if (!resolvePathIfExists(cwd)) {
            throw new Error(`Invalid base directory to search for tests: '${JSON.stringify(cwd)}'`)
        }

        const requireModules = [
            ...toStringArray(options.require),
            ...toStringArray(options.r)
        ]

        /* Require in any modules which the user specified
         * (ie, @babel/register, ts-node/register)
         */
        for (let i = 0, len = requireModules.length; i < len; i++) {
            const modPath = toAbsolutePath(requireModules[i])
            require(modPath)
        }

        const benchmarkTests = functionNames.length
            ? resolveGlobIfExists(functionNames)
            : findBenchmarkTests(cwd)

        if (!benchmarkTests.length) {
            throw new Error(`No benchmark tests were found${
                options.cwd ? ` at '${options.cwd}'` : ""
            }!`)
        }

        logger.debug({ benchmarkTests })

        for (let i = 0, len = benchmarkTests.length; i < len; i++) {
            require(benchmarkTests[i])
        }

        process.exit(0)
    } catch (err) {
        logger.fatal(err)
        process.exit(1)
    }
}

runBenchmarkTests()
