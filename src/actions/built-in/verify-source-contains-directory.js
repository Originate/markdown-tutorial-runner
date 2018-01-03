// @flow

const {bold, cyan} = require('chalk')
const fs = require('fs')
const path = require('path')

// Verifies that a local directory linked in MarkDown exists
module.exports = function (args: {formatter: Formatter, searcher: Searcher}) {
  const directory = args.searcher.tagContent('link_open')
  args.formatter.start(`verifying the ${bold(cyan(directory))} directory exists in the source code`)
  var stats
  try {
    stats = fs.lstatSync(path.join(process.cwd(), directory))
  } catch (err) {
    args.formatter.error(`directory ${cyan(bold(directory))} does not exist in the source code`)
    throw new Error('1')
  }
  if (stats.isDirectory()) {
    args.formatter.success(`directory ${cyan(bold(directory))} exists in the source code`)
  } else {
    args.formatter.error(`${cyan(bold(directory))} exists in the source code but is not a directory`)
    throw new Error('1')
  }
}
