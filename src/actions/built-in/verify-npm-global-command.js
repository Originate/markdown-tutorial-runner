// @flow

import type {Activity} from '../../typedefs/activity.js'
import type {Activity} from '../../typedefs/activity.js'
import type Configuration from '../../configuration.js'
import type Formatter from '../../formatters/formatter.js'
import type Searcher from '../../commands/run/searcher.js'

const {cyan, red} = require('chalk')
const path = require('path')
const trimDollar = require('../../helpers/trim-dollar')

module.exports = function (activity: Activity) {
  activity.formatter.action('NPM module exports the command')
  const commandName = trimDollar(activity.searcher.tagContent(['fence', 'code']))
  const pkg = require(path.join(process.cwd(), 'package.json'))
  activity.formatter.action(`NPM module exports the ${cyan(commandName)} command`)

  if (!hasCommandName(commandName, pkg.bin)) {
    throw new Error(`${cyan('package.json')} does not export a ${red(commandName)} command`)
  }
}

function hasCommandName (commandName: string, exportedCommands: { [string]: string}): boolean {
  return Object.keys(exportedCommands)
               .some((command) => command === commandName)
}
