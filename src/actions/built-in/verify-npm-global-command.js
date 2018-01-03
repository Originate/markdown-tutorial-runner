// @flow

const {cyan, green, red} = require('chalk')
const path = require('path')
const trimDollar = require('../../helpers/trim-dollar')

module.exports = function (args: {configuration: Configuration, formatter: Formatter, searcher: Searcher}) {
  args.formatter.start('verifying exported global command')

  const commandName = trimDollar(args.searcher.tagContent(['fence', 'code']))

  const pkg = require(path.join(process.cwd(), 'package.json'))
  args.formatter.refine(`looking for an exported ${cyan(commandName)} command`)

  if (!hasCommandName(commandName, pkg.bin)) {
    args.formatter.error(`${cyan('package.json')} does not export a ${red(commandName)} command`)
    throw new Error('1')
  }
  args.formatter.success(`provides a global ${green(commandName)} command`)
}

function hasCommandName (commandName: string, exportedCommands: { [string]: string}): boolean {
  return Object.keys(exportedCommands)
               .some((command) => command === commandName)
}
