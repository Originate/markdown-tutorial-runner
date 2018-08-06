// @flow

import type { Publications } from '../configuration/configuration.js'

const addLeadingSlash = require('./add-leading-slash.js')
const localToPublicFilePath = require('./local-to-public-file-path.js')
const path = require('path')
const unixifyPath = require('./unixify-path.js')

module.exports = function relativeToAbsoluteLink (
  link: string,
  filePath: string,
  publications: Publications,
  defaultFile: string
): string {
  const absoluteDir = path.dirname(
    localToPublicFilePath(addLeadingSlash(filePath), publications, defaultFile)
  )
  const full = absoluteDir + '/' + link
  // console.log('full', full)
  const dried = full.replace(/\/+/g, '/').replace(/\\+/g, '\\')
  // console.log('dried', dried)
  const normalized = path.normalize(dried)
  // console.log('normalized', normalized)
  return unixifyPath(normalized)
}
