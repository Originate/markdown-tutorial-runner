// @flow

const {bold, cyan} = require('chalk')
const fs = require('fs')
const path = require('path')

// Verifies that a local directory linked in MarkDown exists
module.exports = function (args: {formatter: Formatter, searcher: Searcher}) {
  const directory = args.searcher.tagContent('link_open')
  args.formatter.action(`directory ${bold(cyan(directory))} exists in the source code`)
  var stats
  try {
    stats = fs.lstatSync(path.join(process.cwd(), directory))
  } catch (err) {
    throw new Error(`directory ${cyan(bold(directory))} does not exist in the source code`)
  }
  if (!stats.isDirectory()) {
    throw new Error(`${cyan(bold(directory))} exists in the source code but is not a directory`)
  }
}
