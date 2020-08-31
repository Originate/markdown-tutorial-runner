import { promises as fs } from "fs"
import { AbsoluteFilePath } from "../../filesystem/absolute-file-path"
import { AstNodeList } from "../standard-AST/ast-node-list"
import { MarkdownParser } from "./md-parser"
import path = require("path")

/** returns the standard AST for the Markdown files given as paths relative to the given sourceDir */
export async function parseMarkdownFiles(filenames: AbsoluteFilePath[], sourceDir: string): Promise<AstNodeList[]> {
  const result: AstNodeList[] = []
  const parser = new MarkdownParser()
  for (const filename of filenames) {
    const content = await fs.readFile(path.join(sourceDir, filename.platformified()), {
      encoding: "utf8",
    })
    result.push(parser.parse(content, filename))
  }
  return result
}
