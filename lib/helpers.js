/* eslint-disable no-console */
const fs = require("fs")
const path = require("path")
const Benchmark = require("benchmark")

/**
 * Ensures either a string value or a list of string values is formatted as a list of non-blank string values.
 *
 * @function
 * @name toStringArray
 * @param {string|Array<string>} val The val to ensure is an array of string values
 * @returns {Array<string>} An array of one or more string values corresponding to the original value(s)
 */
function toStringArray(val) {
    const arr = []

    if (typeof val === "string") {
        if (val.trim()) {
            arr.push(val.trim())
        }
    } else if (Array.isArray(val)) {
        for (let i = 0, len = val.length; i < len; i++) {
            if (typeof val[i] === "string" && val[i].trim()) {
                arr.push(val[i].trim())
            }
        }
    }

    return arr
}

/**
 * Checks if a given file path is a relative file path
 *
 * @function
 * @name isRelativePath
 * @param {string} filePath The file path to check
 * @returns {boolean} Whether or not the file path is a relative file path
 */
function isRelativePath(filePath) {
    return /\.\.?(\/|\\)/.test(filePath)
}

/**
 * Checks a given file path and converts it to an absolute file path (if needed)
 *
 * @function
 * @name toAbsolutePath
 * @param {string} filePath The file path to resolve
 * @returns {string} The resolved absolute file path
 */
function toAbsolutePath(filePath) {
    return isRelativePath(filePath) ? path.resolve(filePath) : filePath
}

/**
 * Retrieves a list of all files starting from the base directory
 *
 * @function
 * @name listAllFilesInFolder
 * @param {string} dir A base directory from which to (recursively) search
 * @returns {Array<string>} The list of absolute file paths starting from the base directory
 */
function listAllFilesInFolder(dir) {
    let files = []
    const baseDir = dir
        ? toAbsolutePath(dir)
        : process.cwd()

    if (/(node_modules|\.git)/.test(baseDir)) {
        return files
    }

    const matches = fs.readdirSync(baseDir)

    for (let i = 0, len = matches.length; i < len; i++) {
        if (/(node_modules|\.git)/.test(matches[i])) {
            continue
        }

        const resolvedPath = path.resolve(baseDir, matches[i])

        if (fs.statSync(resolvedPath).isDirectory()) {
            files = [ ...files, ...listAllFilesInFolder(resolvedPath) ]
        } else {
            files.push(resolvedPath)
        }
    }

    return files
}

/**
 * Retrieves a list of all benchmark test file paths
 *
 * @function
 * @name findBenchmarkTests
 * @param {string} dir A base directory from which to (recursively) search
 * @returns {Array<string>} A list of all (absolute) file paths which represent benchmark tests
 */
function findBenchmarkTests(baseDir) {
    const files = listAllFilesInFolder(baseDir)
    const benchmarkTests = []

    for (let i = 0, len = files.length; i < len; i++) {
        const strContent = fs.readFileSync(files[i], { encoding: "utf8" }).toString()

        /* Check if a file imports from 'reality-check' */
        if (/(\s+from\s+|require\(\s*)('|")reality-check/.test(strContent)) {
            benchmarkTests.push(files[i])
        }
    }

    return benchmarkTests
}

/**
 * Executes a series of benchmark tests and prints their results to the shell
 *
 * @function
 * @name runBenchmarks
 * @param {Array<string|function|Array<*>>} tests A list of benchmark tests. This incudes a caption for the test, the function which executes the test, and the args to pass into that function
 * @param {Object<string, function>} logger A console-like API for logging output
 * @returns {*} The result of [benchmark](https://www.npmjs.com/package/benchmark) test `run()`
 */
function runBenchmarks(tests = [], logger = console) {
    const suite = new Benchmark.Suite()

    let maxNameWidth = 0

    for (let i = 0, len = tests.length; i < len; i++) {
        const [caption, benchmarkTest, ...args] = tests[i]
        maxNameWidth = Math.max(caption.length, maxNameWidth)
        suite.add(caption, () => benchmarkTest(...args))
    }

    const stats = {}

    suite.on("cycle", function cycleCallback(event) {
        const {
            name,
            hz: ops,
            count,
            stats: { rme, sample }
        } = event.target

        const samples = sample.length

        stats[name] = { ops, count, rme, samples }

        logger.info(chalk => chalk`{red.bold [}{cyan.bold ${
            name
        }}{red.bold ]\n}{red.bold   - }{yellow ${
            Number(Math.round(ops)).toLocaleString()
        } }{white ops/sec\n}{bold.red   - }{yellow ${
            Number(count).toLocaleString()
        } }{white times executed\n}{bold.red   - }{yellow ${
            Number(samples).toLocaleString()
        } }{white runs sampled}`)
    })

    suite.on("complete", function completionCallback() {
        const [fastest] = this.filter("fastest").map("name")
        const { ops: mostOpsPerSecond } = stats[fastest]

        logger.info(chalk => chalk`\n⏱ {green Fastest is }{white ${fastest} 🚀}`)

        const runnerUps = Object.keys(stats).filter(key => key !== fastest)
        for (let i = 0, len = runnerUps.length; i < len; i++) {
            const key = runnerUps[i]
            const { ops } = stats[key]

            logger.info(chalk => chalk`{bold.white    - }{cyan ${
                key
            }}{white  ....${
                Array(maxNameWidth - key.length).fill(".").join("")
            } }{red ${
                Number(
                    (((mostOpsPerSecond - ops) / ops) * 100).toFixed(2)
                ).toLocaleString()
            }% }{white slower}{red.bold !}`)
        }
    })

    return suite.run()
}

module.exports = {
    toStringArray,
    toAbsolutePath,
    isRelativePath,
    runBenchmarks,
    findBenchmarkTests,
    listAllFilesInFolder
}
