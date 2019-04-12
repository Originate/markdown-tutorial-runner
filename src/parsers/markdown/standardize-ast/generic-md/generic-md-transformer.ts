import { AbsoluteFilePath } from '../../../../domain-model/absolute-file-path'
import { AstNode } from '../../../ast-node'
import { AstNodeList } from '../../../ast-node-list'
import { OpenTagTracker } from '../../helpers/open-tag-tracker'
import { RemarkableNode } from '../remarkable-node'
import { TagMapper } from '../tag-mapper'

/**
 * Transforms basic Remarkable nodes with opening and closing tags
 * to to standardized AST used by TextRunner
 */
export class GenericMdTransformer {
  /** Tags to ignore */
  static readonly ignore = ['hardbreak', 'inline']

  openTags: OpenTagTracker
  tagMapper: TagMapper

  constructor(openTagTracker: OpenTagTracker) {
    this.openTags = openTagTracker
    this.tagMapper = new TagMapper()
  }

  transform(
    node: RemarkableNode,
    file: AbsoluteFilePath,
    line: number
  ): AstNodeList {
    if (this.isOpeningType(node.type)) {
      return this.transformOpeningNode(node, file, line)
    }
    if (this.isClosingType(node.type)) {
      return this.transformClosingNode(node, file, line)
    }
    if (this.isIgnoredType(node.type)) {
      return new AstNodeList()
    }
    return this.transformStandaloneNode(node, file, line)
  }

  isIgnoredType(nodeType: string): boolean {
    return GenericMdTransformer.ignore.includes(nodeType)
  }

  /**
   * Returns whether the given Remarkable node type describes an opening tag
   */
  isOpeningType(nodeType: string): boolean {
    return nodeType.endsWith('_open')
  }

  /**
   * Returns whether the given Remarkable node type describes a closing tag
   */
  isClosingType(nodeType: string): boolean {
    return nodeType.endsWith('_close')
  }

  /**
   * Transforms a simple opening Remarkable Node
   */
  transformOpeningNode(
    node: RemarkableNode,
    file: AbsoluteFilePath,
    line: number
  ): AstNodeList {
    const result = new AstNodeList()
    const resultNode = new AstNode({
      attributes: node.attributes || {},
      content: '',
      file,
      line,
      tag: this.tagMapper.tagForType(node.type),
      type: node.type
    })
    this.openTags.add(resultNode)
    result.pushNode(resultNode)
    return result
  }

  transformClosingNode(
    node: RemarkableNode,
    file: AbsoluteFilePath,
    line: number
  ): AstNodeList {
    const result = new AstNodeList()
    const openingNodeType = this.openingTypeFor(node.type)
    const openNode = this.openTags.popType(openingNodeType, file, line)
    result.pushNode({
      attributes: openNode.attributes,
      content: '',
      file,
      line,
      tag: `/${openNode.tag}`,
      type: node.type
    })
    return result
  }

  transformStandaloneNode(
    node: RemarkableNode,
    file: AbsoluteFilePath,
    line: number
  ): AstNodeList {
    const result = new AstNodeList()
    result.pushNode({
      attributes: node.attributes || {},
      content: '',
      file,
      line,
      tag: this.tagMapper.tagForType(node.type),
      type: node.type
    })
    return result
  }

  /** Returns the opening type for the given closing type */
  openingTypeFor(closingType: string): string {
    if (closingType.endsWith('_close')) {
      return closingType.substring(0, closingType.length - 6) + '_open'
    }
    return closingType
  }
}
