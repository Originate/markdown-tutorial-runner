import { AbsoluteFilePath } from "../../filesystem/absolute-file-path"
import { AstNode } from "../standard-AST/ast-node"
import { AstNodeList } from "../standard-AST/ast-node-list"
import { TagMapper } from "../tag-mapper"

export class ClosingTagParser {
  closingTagRE: RegExp

  tagMapper: TagMapper

  constructor() {
    this.closingTagRE = /^\s*<[ ]*(\/[ ]*\w+)[ ]*>\s*$/
    this.tagMapper = new TagMapper()
  }

  /** Returns whether the given tag is a closing tag */
  isClosingTag(tag: string): boolean {
    return this.closingTagRE.test(tag)
  }

  parse(tag: string, file: AbsoluteFilePath, line: number): AstNodeList {
    const match = tag.match(this.closingTagRE)
    if (!match) {
      throw new Error(`no tag parsed in ${tag}`)
    }
    const tagName = match[1].replace(/ /g, "")
    const result = new AstNodeList()
    result.push(
      new AstNode({
        attributes: {},
        content: "",
        file,
        line,
        tag: tagName,
        type: this.tagMapper.typeForTag(tagName, {})
      })
    )
    return result
  }
}
