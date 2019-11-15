import { assert } from "chai"
import { isExternalLink } from "./is-external-link"

suite("isExternalLink", function() {
  const tests = [
    ["link without protocol", "//foo.com", true],
    ["link with protocol", "http://foo.com", true],
    ["absolute link", "/one/two.md", false],
    ["relative link", "one.md", false],
    ["relative link up", "../one.md", false]
  ]
  for (const [description, link, expected] of tests) {
    test(description as string, function() {
      assert.equal(isExternalLink(link as string), expected)
    })
  }
})
