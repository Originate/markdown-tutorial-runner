// @flow

const AbsoluteFilePath = require('../../../../domain-model/absolute-file-path.js')
const AstNodeList = require('../../../ast-node-list.js')
const OpenTagTracker = require('../../helpers/open-tag-tracker.js')

module.exports = function (
  node: Object,
  openTags: OpenTagTracker,
  file: string,
  line: number
): AstNodeList {
  const result = new AstNodeList()
  result.pushNode({
    type: node.type,
    tag: '/tbody',
    file,
    line,
    content: '',
    attributes: {}
  })
  openTags.popType('tbody_open', file, line)
  return result
}
