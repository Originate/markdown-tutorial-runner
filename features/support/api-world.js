// @flow

const textRunner = require('../../src/text-runner.js')
const {expect} = require('chai')
const {cyan} = require('chalk')
const dimConsole = require('dim-console')
const fs = require('fs-extra')
const glob = require('glob')
const jsdiffConsole = require('jsdiff-console')
const path = require('path')
const {any, compact, filter, flatten, map, reject, unique} = require('prelude-ls')
const stripAnsi = require('strip-ansi')
const {waitUntil} = require('wait')

class TestFormatter {
  activities: string[]
  console: Console
  endLine: number
  errorMessages: string[]
  filePaths: string[]
  lines: string[]
  startLine: number
  stderr: StdStream
  stdout: StdStream
  stepsCount: number
  text: string
  verbose: boolean
  warnings: string[]

  constructor ({verbose}) {
    this.verbose = verbose
    this.activities = []
    this.errorMessages = []
    this.filePaths = []
    this.lines = []
    this.text = ''
    this.console = {log: (text: string) => { this.text += `${text}\n` }}
    this.stdout = {write: (text) => { this.text += text }}
    this.stderr = {write: (text) => { this.text += text }}
    this.warnings = []
  }

  startFile (filePath: string) {
    if (!this.filePaths.includes(filePath)) {
      this.filePaths.push(filePath)
    }
  }

  start (activity: string) {
    this.activities.push(stripAnsi(activity))
    this.lines.push(this.startLine !== this.endLine ? `${this.startLine}-${this.endLine}` : this.startLine.toString())
    if (this.verbose) console.log(activity)
  }

  success (activity: string) {
    if (activity) {
      this.activities[this.activities.length - 1] = stripAnsi(activity)
      if (this.verbose) console.log(activity)
    }
    if (this.verbose) console.log('success')
  }

  error (error: ErrnoError) {
    this.errorMessages.push(stripAnsi(error.message || error.toString()))
    this.lines.push(unique([this.startLine, this.endLine]).filter((e) => e).join('-'))
    if (this.verbose) console.log(error)
  }

  output (text: string) {
    if (this.verbose) console.log(text)
  }

  refine (activity: string) {
    this.activities[this.activities.length - 1] = stripAnsi(activity)
    this.lines[this.lines.length - 1] = (this.startLine !== this.endLine) ? `${this.startLine}-${this.endLine}` : this.startLine.toString()
    if (this.verbose) console.log(activity)
  }

  setLines (startLine: number, endLine: number) {
    this.startLine = startLine
    this.endLine = endLine
  }

  skip (message: string) {

  }

  suiteSuccess (stepsCount: number) {
    this.stepsCount = stepsCount
  }

  warning (warning: string) {
    this.warnings.push(stripAnsi(warning))
    this.activities.push(stripAnsi(warning))
  }
}

const ApiWorld = function () {
  this.execute = function (args: {command: string, file: string, fast: boolean, format: Formatter}, done: DoneFunction) {
    const existingDir = process.cwd()
    process.chdir(this.rootDir.name)
    this.formatter = new TestFormatter({verbose: this.verbose})
    const formatter: Formatter = args.format || this.formatter
    textRunner({command: args.command, file: args.file, fast: args.fast, format: formatter}, (error) => {
      this.error = error
      this.cwdAfterRun = process.cwd()
      process.chdir(existingDir)
      this.output = this.formatter.text
      done()
    })
  }

  this.verifyCallError = (expectedError: ErrnoError) => {
    jsdiffConsole(this.error, expectedError)
  }

  this.verifyErrormessage = (expectedText: string) => {
    const actual = stripAnsi(this.formatter.errorMessages.join())
    const expected = stripAnsi(expectedText)
    if (!actual.includes(expected)) {
      throw new Error(`Expected\n\n${cyan(actual)}\n\nto contain\n\n${cyan(expected)}\n`)
    }
  }

  this.verifyPrints = (expectedText: string) => {
    // No way to capture console output here.
    // This is tested in the CLI world.
  }

  this.verifyFailure = (table) => {
    if (this.formatter.errorMessages.some((message) => message.includes(table['ERROR MESSAGE']).length === 0)) {
      throw new Error(`Expected\n\n${cyan(this.formatter.errorMessages[0])}\n\nto contain\n\n${cyan(table['ERROR MESSAGE'])}\n`)
    }
    if (table.FILENAME) expect(this.formatter.filePaths).to.include(table.FILENAME)
    if (table.LINE) expect(this.formatter.lines).to.include(table.LINE)
  }

  this.verifyOutput = (table) => {
    if (table.FILENAME) expect(standardizePaths(this.formatter.filePaths)).to.include(table.FILENAME, `${this.formatter.filePaths}`)
    if (table.LINE) expect(this.formatter.lines).to.include(table.LINE)

    if (table.MESSAGE) {
      const activities = standardizePaths(this.formatter.activities)
      if (!activities.some((activity) => activity.includes(table.MESSAGE))) {
        throw new Error(`activity ${cyan(table.MESSAGE)} not found in ${activities.join(', ')}`)
      }
    }
    if (table.WARNING) expect(standardizePaths(this.formatter.warnings)).to.include(table.WARNING)
  }

  this.verifyRanConsoleCommand = (command: string, done: DoneFunction) => {
    waitUntil(() => this.formatter.activities.indexOf(`running console command: ${command}`) > -1, done)
  }

  this.verifyRanOnlyTests = (files: string[]) => {
    files = flatten(files)
    for (let file of files) {
      expect(this.formatter.filePaths).to.include(file, this.formatter.filePaths)
    }

    // verify all other tests have not run
    const filesShouldntRun = glob.sync(`${this.rootDir.name}/**`)
                                 .filter((filename) => fs.statSync(filename).isFile())
                                 .map((filename) => path.relative(this.rootDir.name, filename))
                                 .filter((filename) => filename)
                                 .map((filename) => filename.replace(/\\/g, '/'))
                                 .filter((filename) => files.indexOf(filename) === -1)
    for (let fileShouldntRun of filesShouldntRun) {
      expect(this.formatter.filePaths).to.not.include(fileShouldntRun)
    }
  }

  this.verifyTestsRun = (count: number) => {
    expect(this.formatter.activities).to.have.length(count)
  }

  this.verifyUnknownCommand = (command: string) => {
    expect(this.error).to.equal(`unknown command: ${command}`)
  }
}

function standardizePaths (paths: string[]) {
  return paths.map((path) => path.replace(/\\/g, '/'))
}

module.exports = function () {
  if (process.env.EXOSERVICE_TEST_DEPTH === 'API') {
    this.World = ApiWorld
  }
}
