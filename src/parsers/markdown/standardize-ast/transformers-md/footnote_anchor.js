// @flow

const AbsoluteFilePath = require('../../../../domain-model/absolute-file-path.js')
const AstNode = require('../../../ast-node.js')
const AstNodeList = require('../../../ast-node-list.js')
const OpenTagTracker = require('../../helpers/open-tag-tracker.js')

module.exports = function (
  node: Object,
  openTags: OpenTagTracker,
  file: string,
  line: number
): AstNodeList {
  const result = new AstNodeList()
  const resultNode = new AstNode({
    type: node.type,
    tag: 'footnote_anchor',
    file,
    line,
    content: '',
    attributes: {}
  })
  result.pushNode(resultNode)
  return result
}
