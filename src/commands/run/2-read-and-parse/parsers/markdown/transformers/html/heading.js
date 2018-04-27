// @flow

import type { AstNode } from '../../../../ast-node.js'

const parseAttributes = require('../../helpers/parse-attributes.js')

module.exports = function (
  node: Object,
  filepath: string,
  line: number
): ?AstNode {
  return {
    type: node.type,
    filepath,
    line,
    content: node.text,
    attributes: parseAttributes(node.content, filepath, line)
  }
}
