  /**
   * A factory function which collects the function to be benchmarked at a its corrsponding caption/description
   *
   * @function
   * @name RunBenchmarkTest
   * @param {function} testFn The actual function being benchmarked
   * @param {string} testDesc The description/caption of the function being benchmarked
   */
type RunBenchmarkTest = (
    testFn: (...args?: any[]) => any,
    testDesc: string
) => void

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
 * @returns {Promise<*>} A promise which resolves when the benchmark tests complete
 */
declare function test(testSuiteDescription: string,
    benchmarkCallbackFn: (runBenchmark: RunBenchmarkTest) => void,
    ...additionalArgs?: any[]
): Promise<void>

export { test }
export default test
