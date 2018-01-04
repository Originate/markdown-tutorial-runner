// @flow

const {cyan} = require('chalk')
const mkdirp = require('mkdirp')
const path = require('path')
const debug = require('debug')('textrun:actions:create-directory')

module.exports = function (params: Activity) {
  params.formatter.action('creating directory')

  const directoryName = params.searcher.nodeContent({type: 'code'}, ({nodes, content}) => {
    if (nodes.length === 0) return 'no name given for directory to create'
    if (nodes.length > 1) return `several names given: ${nodes.map((node) => node.content).map((a) => cyan(a)).join(' and ')}`
    if (!content) return 'empty name given for directory to create'
  })
  debug(`directory to create: ${directoryName}`)

  params.formatter.action(`creating directory ${cyan(directoryName)}`)
  const fullPath = path.join(params.configuration.testDir, directoryName)
  debug(`directory to create: ${fullPath}`)
  mkdirp.sync(fullPath)
}
