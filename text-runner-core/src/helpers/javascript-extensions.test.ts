import { assert } from "chai"

import { javascriptExtensions } from "./javascript-extensions.js"

test("javascriptExtensions()", function () {
  const jsExt = javascriptExtensions()
  assert.include(jsExt, "coffee")
  assert.include(jsExt, "js")
  assert.include(jsExt, "ts")
})
