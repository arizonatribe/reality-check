import { test } from "reality-check"

const testProps = Array(1000)
  .fill("arg")
  .reduce((obj, key, idx) => ({
    ...obj,
    [`${key}${idx}`]: Math.floor(Math.random() * (1000 + idx))
  }), {})

const testArgs = Object.values(testProps)

function singleArgFn(props) {
  const vals = Object.values(props)
  return `${vals.join(" + ")} = ${
    vals.reduce((acc, val) => acc + val, 0)
  }`
}

function multiArgFn(...args) {
  return `${args.join(" + ")} = ${
    args.reduce((acc, val) => acc + val, 0)
  }`
}

test("params", benchmark => {
  benchmark(
    () => {
      return singleArgFn(testProps)
    },
    "single arg fn (destructuring params)"
  )
  benchmark(
    () => {
      return multiArgFn(...testArgs)
    },
    "multi arg (parameterized) fn"
  )
})
