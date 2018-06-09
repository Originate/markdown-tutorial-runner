// @flow

import type { Transformer } from './standardize-ast/transformer.js'
import type { TransformerList } from './standardize-ast/transformer-list.js'

const AstNode = require('../ast-node.js')
const AstNodeList = require('../ast-node-list.js')
const FormattingTracker = require('./helpers/formatting-tracker.js')
const isClosingHtmlTagType = require('./helpers/is-closing-html-tag-type.js')
const isOpeningHtmlTagType = require('./helpers/is-opening-html-tag-type.js')
const isSingleHtmlTagType = require('./helpers/is-single-html-tag-type.js')
const loadTransformers = require('./standardize-ast/load.js')
const openingTagFor = require('./helpers/opening-tag-for.js')
const OpenTagTracker = require('./helpers/open-tag-tracker.js')
const UnprintedUserError = require('../../errors/unprinted-user-error.js')
const parseHtmlTag = require('./helpers/parse-html-tag.js')

var mdTransformers: TransformerList = loadTransformers()

// AstStandardizer converts the AST created by Remarkable
// into the standardized AST used by TextRunner
module.exports = class AstStandardizer {
  filepath: string
  formattingTracker: FormattingTracker
  openTags: OpenTagTracker
  result: AstNodeList
  line: number

  constructor (filepath: string) {
    this.filepath = filepath
    this.openTags = new OpenTagTracker()
    this.result = new AstNodeList()
    this.line = 1
  }

  standardize (ast: Object): AstNodeList {
    for (let node of ast) {
      if (node.lines) this.line = Math.max(node.lines[0] + 1, this.line)
      this.processSoftBreak(node) ||
        this.processMdNode(node) ||
        this.processHtmlNode(node) ||
        alertUnknownNodeType(node, this.filepath, this.line)

      if (node.children) {
        for (let child of node.children) child.lines = node.lines
        this.standardize(node.children)
      }
    }
    return this.result
  }

  processHtmlNode (node: Object): boolean {
    if (node.type !== 'htmltag' && node.type !== 'htmlblock') return false
    const [tag, attributes] = parseHtmlTag(
      node.content,
      this.filepath,
      this.line
    )
    const type = this.getType(tag, attributes)
    const astNode = new AstNode({
      type,
      tag,
      content: '',
      line: this.line,
      file: this.filepath,
      attributes
    })
    if (isSingleHtmlTagType(tag)) {
      // nothing to do here
    } else if (isOpeningHtmlTagType(tag)) {
      this.openTags.add(astNode)
    } else if (isClosingHtmlTagType(tag)) {
      const openingNode = this.openTags.pop(openingTagFor(astNode.type))
      astNode.attributes = openingNode.attributes
    }
    this.result.push(astNode)
    return true
  }

  processMdNode (node: Object): boolean {
    const transformer: Transformer = mdTransformers[node.type]
    if (!transformer) return false
    const transformed = transformer(
      node,
      this.openTags,
      this.filepath,
      this.line
    )
    for (const node of transformed) {
      this.result.push(node)
    }
    return true
  }

  processSoftBreak (node: Object): boolean {
    if (node.type !== 'softbreak') return false
    this.line += 1
    return true
  }

  getType (tag: string, attributes: { [string]: string }): string {
    if (tag === 'a' && attributes['href']) return 'link_open'
    if (tag === '/a' && this.openTags.peek().attributes['href']) {
      return 'link_close'
    }
    const result = types[tag]
    if (!result) {
      throw new UnprintedUserError(
        `AstStandardizer: unknown tag type: '${tag}'`
      )
    }
    return result
  }
}

const types = {
  h1: 'heading_open',
  '/h1': 'heading_close',
  img: 'image',
  code: 'code_open',
  '/code': 'code_close',
  a: 'anchor_open',
  '/a': 'anchor_close',
  strong: 'strong_open',
  '/strong': 'strong_close',
  em: 'em_open',
  '/em': 'em_close'
}

function alertUnknownNodeType (node, filepath: string, line: number) {
  throw new UnprintedUserError(
    `AstStandardizer: unknown node type: ${node.type}`,
    filepath,
    line
  )
}
