// @flow

import type {AstNode} from '../../typedefs/ast-node.js'
import type {AstNodeList} from '../../typedefs/ast-node-list.js'
import type Configuration from '../../configuration.js'
import type Formatter from '../../formatters/formatter.js'

const {cyan, magenta, red} = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const request = require('request-promise-native')

// Checks for broken hyperlinks
module.exports = async function (params: {filename: string, formatter: Formatter, nodes: AstNodeList, configuration: Configuration}) {
  params.formatter.start(`checking image`)
  const node = params.nodes[0]
  if (node.src == null || node.src === '') {
    params.formatter.error('image tag without source')
    throw new Error('1')
  }
  const imagePath = path.join(path.dirname(params.filename), node.src)
  params.formatter.refine(`checking image ${cyan(imagePath)}`)
  if (isRemoteImage(node)) {
    await checkRemoteImage(node, params.formatter, params.configuration)
  } else {
    await checkLocalImage(imagePath, params.formatter)
  }
}

async function checkLocalImage (imagePath: string, formatter: Formatter) {
  try {
    await fs.stat(path.join(process.cwd(), imagePath))
    formatter.success(`image ${cyan(imagePath)} exists`)
  } catch (err) {
    formatter.error(`image ${red(imagePath)} does not exist`)
    throw new Error(1)
  }
}

async function checkRemoteImage (node: AstNode, formatter: Formatter, configuration: Configuration) {
  if (configuration.get('fast')) {
    formatter.skip(`skipping external image ${node.src || ''}`)
    return
  }

  try {
    await request({url: node.src, timeout: 2000})
    formatter.success(`image ${cyan(node.src)} exists`)
  } catch (err) {
    if (err.statusCode === 404) {
      formatter.warning(`image ${magenta(node.src)} does not exist`)
    } else if (err.message === 'ESOCKETTIMEDOUT') {
      formatter.warning(`image ${magenta(node.src)} timed out`)
    } else {
      throw err
    }
  }
}

function isRemoteImage (node: AstNode): boolean {
  if (node.src != null) {
    // $FlowFixMe
    return node.src.startsWith('//') || node.src.startsWith('http://') || node.src.startsWith('https://')
  } else {
    return false
  }
}
