// @flow

import type {ActivityList} from '../../typedefs/activity-list.js'
import type Configuration from '../../configuration.js'
import type Formatter from '../../formatters/formatter.js'
import type {LinkTargetList} from '../../typedefs/link-target-list.js'

const ActionManager = require('../../actions/action-manager.js')
const ActivityListBuilder = require('./activity-list-builder')
const {cyan} = require('chalk')
const delay = require('delay')
const fs = require('fs-extra')
const LinkTargetBuilder = require('./link-target-builder')
const MarkdownParser = require('../../parsers/markdown/markdown-parser')
const path = require('path')
const UnprintedUserError = require('../../errors/unprinted-user-error.js')
const util = require('util')

// Runs the given Markdown file
class MarkdownFileRunner {
  filePath: string
  formatter: Formatter
  actions: ActionManager
  configuration: Configuration
  parser: MarkdownParser
  activityListBuilder: ActivityListBuilder
  linkTargetBuilder: LinkTargetBuilder
  runData: ActivityList

  constructor (value: {filePath: string, formatter: Formatter, actions: ActionManager, configuration: Configuration, linkTargets: LinkTargetList}) {
    this.filePath = value.filePath
    this.formatter = value.formatter
    this.configuration = value.configuration
    this.parser = new MarkdownParser()
    this.activityListBuilder = new ActivityListBuilder({
      actions: value.actions,
      filePath: this.filePath,
      formatter: this.formatter,
      configuration: this.configuration,
      linkTargets: value.linkTargets})
    this.linkTargetBuilder = new LinkTargetBuilder({linkTargets: value.linkTargets})
  }

  // Prepares this runner
  async prepare (): Promise<void> {
    // Need to start the file here
    // so that the formatter has the filename
    // in case there are errors preparing.
    var markdownText = await fs.readFile(this.filePath, {encoding: 'utf8'})
    markdownText = markdownText.trim()
    if (markdownText.length === 0) {
      this.formatter.startFile(this.filePath)
      throw new UnprintedUserError(`found empty file ${cyan(path.relative(process.cwd(), this.filePath))}`)
    }
    const astNodeList = this.parser.parse(markdownText)
    const linkTargets = this.linkTargetBuilder.buildLinkTargets(this.filePath, astNodeList)
    this.runData = this.activityListBuilder.build(linkTargets)
  }

  // Runs this runner
  // (after it has been prepared)
  async run (): Promise<number> {
    for (let block of this.runData) {
      await this._runBlock(block)
    }
    return this.runData.length
  }

  async _runBlock (block) {
    // waiting 1 ms here to give Node a chance to run queued up logic from previous steps
    await delay(1)
    block.formatter.startFile(block.filename)
    if (block.startLine != null && block.endLine != null) {
      block.formatter.setLines(block.startLine, block.endLine)
    }
    try {
      if (block.runner.length === 1) {
        // synchronous action method or returns a promise
        await Promise.resolve(block.runner(block))
      } else {
        // asynchronous action method
        const promisified = util.promisify(block.runner)
        await promisified(block)
      }
      block.formatter.success()
    } catch (err) {
      if (isUserError(err)) {
        throw new UnprintedUserError(err)
      } else {
        // here we have a developer error
        throw err
      }
    }
  }
}

function isUserError (err: Error): boolean {
  return err.name === 'Error'
}

module.exports = MarkdownFileRunner
