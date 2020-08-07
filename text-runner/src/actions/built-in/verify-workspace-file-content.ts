import * as assertNoDiff from "assert-no-diff"
import color from "colorette"
import { promises as fs } from "fs"
import path from "path"
import { ActionArgs } from "../types/action-args"

export default async function verifyWorkspaceFileContent(args: ActionArgs) {
  const filePath = args.nodes.textInNodeOfType("strong", "em")
  const fullPath = path.join(args.configuration.workspace, filePath)
  args.name(`verifying file ${color.cyan(filePath)}`)
  args.log(`verify file ${fullPath}`)
  const actualContent = await readFile(filePath, fullPath)
  const expectedContent = args.nodes.textInNodeOfType("fence", "code")
  try {
    assertNoDiff.trimmedLines(actualContent.trim(), expectedContent.trim())
  } catch (err) {
    throw new Error(`mismatching content in ${color.cyan(color.bold(filePath))}:\n${err.message}`)
  }
}

async function readFile(filePath: string, fullPath: string): Promise<string> {
  try {
    const result = await fs.readFile(fullPath, "utf8")
    return result
  } catch (err) {
    if (err.code === "ENOENT") {
      // const files = fs.readdir())
      throw new Error(`file ${color.red(filePath)} not found`)
    } else {
      throw err
    }
  }
}
