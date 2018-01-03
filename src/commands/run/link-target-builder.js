// @flow

import type {AstNodeList} from '../../typedefs/ast-node-list.js'
import type {LinkTargetList} from '../../typedefs/link-target-list.js'

const dashify = require('dashify')

class LinkTargetBuilder {
  // determines which files contain which link targets (anchors)

  // the LinkTarget list that this builder is supposed to populate
  linkTargets: LinkTargetList

  constructor (value: {linkTargets: LinkTargetList}) {
    this.linkTargets = value.linkTargets
  }

  buildLinkTargets (filePath: string, tree: AstNodeList) {
    this.linkTargets[filePath] = this.linkTargets[filePath] || []
    for (let node of tree) {
      switch (node.type) {
        case 'htmltag':
          if (node.content != null) {
            const matches = node.content.match(/<a name="([^"]*)">/)
            if (matches != null) {
              this.linkTargets[filePath].push({type: 'anchor', name: matches[1]})
            }
          }
          break

        case 'heading':
          this.linkTargets[filePath].push({type: 'heading',
            name: dashify(node.content),
            text: node.content,
            level: node.level})
          break
      }
    }

    return tree
  }
}

module.exports = LinkTargetBuilder
