import { AbsoluteFilePath } from '../../../../domain-model/absolute-file-path'
import { AstNode } from '../../../ast-node'
import { AstNodeList } from '../../../ast-node-list'
import { getHtmlBlockTag } from '../../helpers/get-html-block-tag'
import { OpenTagTracker } from '../../helpers/open-tag-tracker'
import { parseHtmlTag } from '../../helpers/parse-html-tag'
import { removeHtmlComments } from '../../helpers/remove-html-comments'
import { RemarkableNode } from '../remarkable-node'
import { TagMapper } from '../tag-mapper'

/** Transforms generic HTML tags */
export class GenericHtmlTagTransformer {
  openTags: OpenTagTracker
  tagMapper: TagMapper

  constructor(openTags: OpenTagTracker, tagMapper: TagMapper) {
    this.openTags = openTags
    this.tagMapper = tagMapper
  }

  canTransform(node: RemarkableNode): boolean {
    return node.type === 'htmltag'
  }

  transform(
    node: RemarkableNode,
    file: AbsoluteFilePath,
    line: number
  ): AstNodeList {
    const sanitizedContent = removeHtmlComments(node.content)
    const tagName = getHtmlBlockTag(sanitizedContent, file, line)
    if (this.isClosingHtmlTag(tagName)) {
      return this.transformClosingHtmlTag(tagName, file, line)
    } else {
      return this.transformOpeningHtmlTag(tagName, file, line)
    }
  }

  transformClosingHtmlTag(
    tagName: string,
    file: AbsoluteFilePath,
    line: number
  ) {
    const result = new AstNodeList()
    const openingType = this.tagMapper.openingTypeForTag(tagName)
    const openingTag = this.openTags.popType(openingType, file, line)
    const resultNode = new AstNode({
      attributes: openingTag.attributes,
      content: '',
      file,
      line,
      tag: tagName,
      type: this.tagMapper.typeForTag(tagName)
    })
    result.pushNode(resultNode)
    return result
  }

  transformOpeningHtmlTag(
    tagName: string,
    file: AbsoluteFilePath,
    line: number
  ): AstNodeList {
    const result = new AstNodeList()
    const [tag, attributes] = parseHtmlTag(tagName, file.platformified(), line)
    const resultNode = new AstNode({
      attributes,
      content: '',
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
    return tag.startsWith('/')
  }
}
