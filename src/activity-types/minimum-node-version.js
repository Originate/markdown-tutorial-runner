// @flow

import type { Activity } from '../commands/run/activity.js'

const { cyan } = require('chalk')
const fs = require('fs')
const jsYaml = require('js-yaml')

module.exports = function (activity: Activity) {
  const documentedVersion = parseInt(activity.searcher.tagContent('text'))
  if (isNaN(documentedVersion)) { throw new Error('given Node version is not a number') }
  activity.formatter.setTitle(
    `supported NodeJS version should be ${cyan(documentedVersion)}`
  )

  const supportedVersion = getSupportedVersion()
  if (supportedVersion !== documentedVersion) {
    throw new Error(
      `minimum Node version is ${cyan(documentedVersion)}, should be ${cyan(
        supportedVersion
      )}`
    )
  }
}

function getSupportedVersion () {
  const content = loadYmlFile('.travis.yml')
  if (!content) throw new Error('.travis.yml is empty')
  const minimumVersion = parseInt(minimum(content.node_js))
  if (isNaN(minimumVersion)) throw new Error('listed version is not a number')
  return minimumVersion
}

function loadYmlFile (filename: string) {
  const fileContent = fs.readFileSync(filename, { encoding: 'utf8' })
  return jsYaml.safeLoad(fileContent)
}

// Minimum returns the smallest of the given numbers
function minimum (numbers: number[] | number): number {
  if (Array.isArray(numbers)) {
    return numbers.reduce((n, sum) => (n < sum ? n : sum), 10000)
  } else {
    return numbers
  }
}
