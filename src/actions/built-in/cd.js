// @flow

import type {Activity} from '../../typedefs/activity.js'
import type {AstNodeList} from '../../typedefs/ast-node-list.js'
import type Configuration from '../../configuration.js'
import type Formatter from '../../formatters/formatter.js'
import type Searcher from '../../commands/run/searcher.js'

const {bold, cyan} = require('chalk')
const path = require('path')
const debug = require('debug')('textrun:actions:cd')

// Changes the current working directory to the one given in the hyperlink or code block
module.exports = function (activity: Activity) {
  activity.formatter.action('changing the current working directory')
  const directory = activity.searcher.tagContent(['link_open', 'code'])
  activity.formatter.action(`changing into the ${bold(cyan(directory))} directory`)
  activity.formatter.output(`cd ${directory}`)
  const fullPath = path.join(activity.configuration.testDir, directory)
  debug(`changing into directory '${fullPath}`)
  try {
    process.chdir(fullPath)
  } catch (e) {
    if (e.code === 'ENOENT') throw new Error(`directory ${directory} not found`)
    throw e
  }
}
