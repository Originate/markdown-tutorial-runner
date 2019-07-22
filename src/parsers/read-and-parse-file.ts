import color from "colorette"
import fs from "fs-extra"
import { AbsoluteFilePath } from "../finding-files/absolute-file-path"
import { AstNodeList } from "./standard-AST/ast-node-list"
import { parseMarkdown } from "../parsers/markdown/parse-markdown"

/** high-level API of the parser: returns the AST for the file at the given path */
export async function readAndParseFile(
  filename: AbsoluteFilePath
): Promise<AstNodeList> {
  const content = (await fs.readFile(filename.platformified(), {
    encoding: "utf8"
  })).trim()
  if (content.length === 0) {
    console.log(color.magenta("found empty file " + filename.platformified()))
  }
  return parseMarkdown(content, filename)
}
