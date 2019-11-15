import { assert } from "chai"
import { removeLeadingSlash } from "./remove-leading-slash"

suite("removeLeadingSlash", function() {
  const tests = {
    "/foo/bar/": "foo/bar/",
    "\\foo\\bar\\": "foo\\bar\\",
    "foo/bar/": "foo/bar/"
  }
  for (const [input, expected] of Object.entries(tests)) {
    test(input, function() {
      assert.equal(removeLeadingSlash(input), expected)
    })
  }
})
