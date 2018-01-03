// @flow

import type Configuration from '../../configuration.js'
import type Formatter from '../../formatters/formatter.js'
import type Searcher from '../../commands/run/searcher.js'
import type {WriteStream} from 'observable-process'

const callArgs = require('../../helpers/call-args')
const {cyan} = require('chalk')
const debug = require('debug')('textrun:actions:run-console-command')
const ObservableProcess = require('observable-process')
const path = require('path')
const trimDollar = require('../../helpers/trim-dollar')
const util = require('util')
const xml2js = require('xml2js')

type ProcessInput = {
  textToWait: ?string,
  input: string
}

// Runs the given commands on the console.
// Waits until the command is finished.
module.exports = async function (params: {configuration: Configuration, formatter: Formatter, searcher: Searcher}) {
  params.formatter.start('running console command')

  const commandsToRun = params.searcher.nodeContent({type: 'fence'}, ({content, nodes}) => {
    if (nodes.length === 0) return 'no code blocks found'
    if (nodes.length > 1) return 'found #{nodes.length} fenced code blocks. Expecting only one.'
    if (!content) return 'the block that defines console commands to run is empty'
  }).split('\n')
    .map((command) => command.trim())
    .filter((e) => e)
    .map(trimDollar)
    .map(makeGlobal(params.configuration))
    .join(' && ')

  const inputText = params.searcher.nodeContent({type: 'htmlblock'})
  const input = await getInput(inputText, params.formatter)
  params.formatter.refine(`running console command: ${cyan(commandsToRun)}`)
  // NOTE: this needs to be global because it is used in the "verify-run-console-output" step
  global.runConsoleCommandOutput = ''
  const processor = new ObservableProcess({
    commands: callArgs(commandsToRun),
    cwd: params.configuration.testDir,
    stdout: log(params.formatter.stdout),
    stderr: params.formatter.stderr
  })

  for (let inputLine of input) {
    enter(processor, inputLine)
  }

  try {
    await processor.waitForEnd()
    params.formatter.success()
  } catch (err) {
    params.formatter.error(err)
  }
}

async function enter (processor: ObservableProcess, input: ProcessInput) {
  if (!input.textToWait) {
    processor.enter(input.input)
  } else {
    await processor.waitForText(input.textToWait)
    processor.enter(input.input)
  }
}

async function getInput (text: string, formatter: Formatter) {
  if (!text) return []
  const xml2jsp = util.promisify(xml2js.parseString)
  const xml = await xml2jsp(text)
  var result = []
  for (let tr of xml.table.tr) {
    if (tr.td) {
      if (tr.td.length === 1) {
        result.push({ textToWait: null, input: tr.td[0] })
      } else {
        result.push({textToWait: tr.td[0], input: tr.td[tr.td.length - 1]})
      }
    }
  }
  return result
}

function makeGlobal (configuration: Configuration) {
  configuration = configuration || {}
  var globals = {}
  try {
    // $FlowFixMe: Ignore null-pointer exceptions here since we have a default value
    globals = configuration.fileData.actions.runConsoleCommand.globals
  } catch (e) {}
  debug(`globals: ${JSON.stringify(globals)}`)
  return function (commandText) {
    const commandParts = commandText.split(' ')
    const command = commandParts[0]
    debug(`searching for global replacement for ${command}`)
    const replacement = globals[command]
    if (replacement) {
      debug(`found replacement: ${replacement}`)
      return path.join(configuration.sourceDir, replacement) + ' ' + commandParts.splice(1).join(' ')
    } else {
      return commandText
    }
  }
}

function log (stdout): WriteStream {
  return {
    write: (text) => {
      global.runConsoleCommandOutput += text
      return stdout.write(text)
    }
  }
}
