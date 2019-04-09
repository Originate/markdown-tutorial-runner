import { AbsoluteFilePath } from '../../../domain-model/absolute-file-path'
import { AstNode } from '../../ast-node'
import { AstNodeList } from '../../ast-node-list'
import { OpenTagTracker } from '../helpers/open-tag-tracker'

/**
 * Transforms basic Remarkable nodes with opening and closing tags
 * to to standardized AST used by TextRunner
 */
export class OpenCloseMdTransformer {
  /**
   * Remarkable node types that we can handle here
   */
  static readonly mappings = {
    bullet_list: 'ul'
  }

  openTags: OpenTagTracker

  constructor(openTagTracker: OpenTagTracker) {
    this.openTags = openTagTracker
  }

  transform(node: any, file: AbsoluteFilePath, line: number): AstNodeList {
    if (this.isOpeningType(node.type)) {
      return this.transformOpeningNode(node, file, line)
    }
    if (this.isClosingType(node.type)) {
      return this.transformClosingNode(node, file, line)
    }
    throw new Error(`Unknown node type: ${node.type}`)
    // return this.transformStandaloneNode(node, file, line)
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
    node: any,
    file: AbsoluteFilePath,
    line: number
  ): AstNodeList {
    const result = new AstNodeList()
    const resultNode = new AstNode({
      attributes: node.attributes || {},
      content: '',
      file,
      line,
      tag: this.openingTagFor(node.type),
      type: node.type
    })
    this.openTags.add(resultNode)
    result.pushNode(resultNode)
    return result
  }

  transformClosingNode(
    node: any,
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
      tag: this.closingTagFor(node.type),
      type: node.type
    })
    return result
  }

  /**
   * Returns the opening HTML tag name for the given Remarkable node type
   */
  openingTagFor(nodeType: string): string {
    if (this.isOpeningType(nodeType)) {
      const genericNodeType = nodeType.replace('_open', '')
      const mapped = OpenCloseMdTransformer.mappings[genericNodeType]
      if (mapped) {
        return mapped
      }
      return genericNodeType
    }
    return nodeType
  }

  /**
   * Returns the opening node type for the given Remarkable node type
   */
  openingTypeFor(nodeType: string): string {
    if (!this.isClosingType(nodeType)) {
      throw new Error(`Node type ${nodeType} is not a closing type`)
    }
    return nodeType.replace('_close', '_open')
  }

  /**
   * Returns the closing HTML tag name for the given closing Remarkable type
   */
  closingTagFor(nodeType: string): string {
    if (!this.isClosingType(nodeType)) {
      throw new Error(`Not a closing type: ${nodeType}`)
    }

    const normalizedType = nodeType.replace('_close', '')
    const mappedType = OpenCloseMdTransformer.mappings[normalizedType]
    if (mappedType) {
      return `/${mappedType}`
    }
    return `/${normalizedType}`
  }
}
