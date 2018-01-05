// @flow

import type {Activity} from '../../typedefs/activity.js'
import type Configuration from '../../configuration.js'
import type Formatter from '../../formatters/formatter.js'
import type Searcher from '../../commands/run/searcher.js'

const {cyan} = require('chalk')
const jsonfile = require('jsonfile')
const path = require('path')
const trimDollar = require('../../helpers/trim-dollar')

module.exports = function (activity: Activity) {
  activity.formatter.action('verifying NPM installation instructions')
  const installText = trimDollar(activity.searcher.tagContent(['fence', 'code']))
  const pkg = jsonfile.readFileSync(path.join(process.cwd(), 'package.json'))
  activity.formatter.action(`verify NPM installs ${cyan(pkg.name)}`)

  if (missesPackageName(installText, pkg.name)) {
    throw new Error(`could not find ${cyan(pkg.name)} in installation instructions`)
  }
}

function missesPackageName (installText: string, packageName: string): boolean {
  // Note: cannot use minimist here
  //       because it is too stupid to understand
  //       that NPM uses '-g' by itself, and not as a switch for the argument after it
  return installText.split(' ')
                    .map((word) => word.trim())
                    .filter((word) => word === packageName)
                    .length === 0
}
