import { AbsoluteFilePath } from "../../../../filesystem/absolute-file-path"
import { AstNode } from "../../../standard-AST/ast-node"
import { AstNodeList } from "../../../standard-AST/ast-node-list"
import { getHtmlBlockTag } from "../../helpers/get-html-block-tag"
import { OpenTagTracker } from "../../helpers/open-tag-tracker"
import { parseHtmlTag } from "../../helpers/parse-html-tag"
import { removeHtmlComments } from "../../helpers/remove-html-comments"
import { TagMapper } from "../tag-mapper"
import { RemarkableNode } from "../types/remarkable-node"
import { TransformerCategory } from "../types/transformer-category"

export class GenericHtmlTagTransformerBlock implements TransformerCategory {
  private readonly openTags: OpenTagTracker
  private readonly tagMapper: TagMapper

  constructor(openTags: OpenTagTracker, tagMapper: TagMapper) {
    this.openTags = openTags
    this.tagMapper = tagMapper
  }

  canTransform(node: RemarkableNode): boolean {
    return node.type === "htmltag"
  }

  async loadTransformers() {
    return
  }

  async transform(
    node: RemarkableNode,
    file: AbsoluteFilePath,
    line: number
  ): Promise<AstNodeList> {
    const sanitizedContent = removeHtmlComments(node.content)
    const tagName = getHtmlBlockTag(sanitizedContent, file, line)
    if (this.isClosingHtmlTag(tagName)) {
      return this.transformClosingHtmlTag(tagName, file, line)
    } else {
      return this.transformOpeningHtmlTag(node, file, line)
    }
  }

  transformClosingHtmlTag(
    tagName: string,
    file: AbsoluteFilePath,
    line: number
  ) {
    const result = new AstNodeList()
    const openingTag = this.openTags.popTag(
      tagName.replace("/", ""),
      file,
      line
    )
    const resultNode = new AstNode({
      attributes: openingTag.attributes,
      content: "",
      file,
      line,
      tag: tagName,
      type: openingTag.type.replace("_open", "_close")
    })
    result.pushNode(resultNode)
    return result
  }

  transformOpeningHtmlTag(
    node: RemarkableNode,
    file: AbsoluteFilePath,
    line: number
  ): AstNodeList {
    const result = new AstNodeList()
    const [tag, attributes] = parseHtmlTag(
      node.content,
      file.platformified(),
      line
    )
    const resultNode = new AstNode({
      attributes,
      content: "",
      file,
      line,
      tag,
      type: this.tagMapper.typeForTag(tag)
    })
    this.openTags.add(resultNode)
    result.pushNode(resultNode)
    return result
  }

  private isClosingHtmlTag(tag: string): boolean {
    return tag.startsWith("/")
  }
}
