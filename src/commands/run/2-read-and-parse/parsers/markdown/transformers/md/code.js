// @flow

import type { AstNode } from '../../../../ast-node.js'

const OpenTagTracker = require('../../helpers/open-tag-tracker.js')

module.exports = function (
  node: Object,
  openTags: OpenTagTracker,
  file: string,
  line: number
): ?AstNode {
  return {
    type: 'code',
    tag: 'code',
    file: file,
    line,
    content: node.content,
    attributes: {}
  }
}
