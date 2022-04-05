const logger = require("@vanillas/chalk-console-logger")
const { runBenchmarks } = require("./helpers")

/**
 * Runs a suite of CPU performance benchmarks against one or more user-provided functions.
 *
 * @async
 * @function
 * @name test
 * @throws {TypeError} When the test suite description is missing or not a string
 * @throws {TypeError} When the benchmark callback function is missing or not a function
 * @throws {Error} If the benchmark assert factory function has NOT been invoked on any function (in other words, if there are no functions to benchmark)
 * @throws {Error} If the benchmark assert factory function is not provided a function (1st param) and a description (2nd param)
 * @throws {Error} If the functions being benchmarked return different values (otherwise a broken function could win-out because it bailed early)
 * @param {string} testSuiteDescription The description of the suite of functions being benchmarked
 * @param {function} benchmarkCallbackFn A callback function where one or more functions can be benchmarked using the benchmark assert provided as the single arg into the callback function
 * @param {Array<*>} [...additionalArgs] Any optional args to pass into the individual functions being benchmarked (using JavaScript's `call` style rather than `apply` style for parameterizing args)
 */
async function test(
    testSuiteDescription,
    benchmarkCallbackFn,
    ...additionalArgs
) {
    if (testSuiteDescription == null || (typeof testSuiteDescription === "string" && !testSuiteDescription.trim())) {
        throw new TypeError("Missing a description of the benchmark tests")
    }

    /* If the test suite is unnamed then the first arg is the benchmark callback function */
    if (typeof testSuiteDescription === "function") {
        additionalArgs.unshift(benchmarkCallbackFn)
        benchmarkCallbackFn = testSuiteDescription
        testSuiteDescription = ""
    }

    if (typeof benchmarkCallbackFn !== "function") {
        throw new TypeError("Must provide a callback function with one or more functions to benchmark")
    }

    const benchmarkTests = []

    function benchmarkAssert(testFn, testDesc) {
        if (typeof testFn !== "function") {
            throw new TypeError(`A function should be provided to be benchmarked, but instead was provided a value of type: '${typeof testFn}'`)
        }
        if (testDesc != null && typeof testDesc !== "string") {
            throw new TypeError("If a 2nd arg is provided to the benchmark assert, it should just be a (string) description of the test")
        }

        benchmarkTests.push([testFn, testDesc])
    }

    await benchmarkCallbackFn(benchmarkAssert)

    if (!benchmarkTests.length) {
        throw new Error(`No functions were provided to benchmark${
            testSuiteDescription ? ` for '${testSuiteDescription}'` : ""
        }`)
    }

    try {
        let compareVal
        let testCount = 0
        const numberOfTests = benchmarkTests.length

        for (let [fn, desc] of benchmarkTests) {
            testCount++

            let returnVal = await fn(...additionalArgs)

            if (testCount === 1) {
                compareVal = returnVal
            }

            if (compareVal !== returnVal) {
                throw new Error(`The ouput for test #${
                    testCount
                } differs from the output for test #1${
                    testCount > 2 ? ` - #${testCount - 1}` : ""
                }:\n✅   ${compareVal}\nvs\n❌   ${returnVal}`)
            }
        }

        return runBenchmarks(
            benchmarkTests.map(([fn, desc]) => ([desc, fn, ...additionalArgs])),
            logger
        )
    } catch (err) {
        logger.error(`There was a problem comparing the output of each of the functions being benchmarked${
            testSuiteDescription ? ` for '${testSuiteDescription}'` : ""
        }`)

        throw err
    }
}

module.exports = test
module.exports.test = test
