// @flow

import type {WriteStream} from 'observable-process'

const callArgs = require('../../helpers/call-args')
const {bold, cyan} = require('chalk')
const ObservableProcess = require('observable-process')
const path = require('path')
const trimDollar = require('../../helpers/trim-dollar')
const debug = require('debug')('start-console-command')

// Runs the given commands on the console.
// Leaves the command running.
module.exports = async function (args: Activity) {
  args.formatter.action('starting a long-running process')

  const commandsToRun = args.searcher.tagContent('fence')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .map(trimDollar)
    .map(makeGlobal(args.configuration))
    .join(' && ')

  args.formatter.action(`starting a long-running process: ${bold(cyan(commandsToRun))}`)
  global.startConsoleCommandOutput = ''
  global.runningProcess = new ObservableProcess({
    commands: callArgs(commandsToRun),
    cwd: args.configuration.testDir,
    stdout: log(args.formatter.stdout),
    stderr: args.formatter.stderr
  })
  global.runningProcessEnded = true
}

function log (stdout): WriteStream {
  return {
    write: (text) => {
      global.startConsoleCommandOutput += text
      return stdout.write(text)
    }
  }
}

function makeGlobal (configuration: Configuration) {
  configuration = configuration || {}
  var globals = {}
  try {
    globals = configuration.fileData.actions.runConsoleCommand.globals
  } catch (e) {} // Ignore null-pointer exceptions here since we have a default value
  debug(`globals: ${JSON.stringify(globals)}`)
  return function (commandText) {
    const commandParts = commandText.split(' ')
    const command = (commandParts)[0]
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
