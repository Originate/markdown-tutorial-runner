import { assert } from "chai"
import * as fs from "fs"
import * as path from "path"

import * as ast from "../../ast"
import { NodeScaffoldData } from "../../ast"
import * as files from "../../filesystem/index"
import { parse } from "./parse"

suite("MdParser.parseFile()", function () {
  const sharedFixtureDir = path.join("src", "parsers", "fixtures")
  const specificFixtureDir = path.join("src", "parsers", "markdown", "fixtures")
  for (const fixtureDir of [sharedFixtureDir, specificFixtureDir]) {
    for (const testDirName of fs.readdirSync(fixtureDir)) {
      const testDirPath = path.join(fixtureDir, testDirName)
      test(`parsing '${testDirName}'`, async function () {
        const expectedJSON: NodeScaffoldData[] = JSON.parse(
          fs.readFileSync(path.join(testDirPath, "result.json"), "utf-8")
        )
        const expected = new ast.NodeList()
        for (const expectedNodeData of expectedJSON) {
          if (expectedNodeData.file && typeof expectedNodeData.file === "string") {
            expectedNodeData.file = expectedNodeData.file.replace("*", "md")
          }
          expectedNodeData.sourceDir = testDirPath
          expected.push(ast.Node.scaffold(expectedNodeData))
        }
        const actual = await parse([new files.FullFilePath("input.md")], new files.SourceDir(testDirPath))
        assert.deepEqual(actual[0], expected)
      })
    }
  }
})
