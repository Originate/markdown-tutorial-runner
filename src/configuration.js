const fs = require('fs')
const requireUncached = require('require-uncached')
require('require-yaml')
const debug = require('debug')('textrun:configuration')

const defaultValues = {
  fast: false,
  files: '**/*.md',
  format: 'robust',
  useTempDirectory: false,
  classPrefix: 'tr_',
  actions: {
    runConsoleCommand: {
      globals: {}
    }
  }
}

// Encapsulates logic around the configuration
class Configuration {
  constructor (configFilePath, constructorArgs :string) {
    this.configFilePath = configFilePath
    this.constructorArgs = constructorArgs || {}

    if (this.configFilePath) {
      debug(`loading configuration file: ${this.configFilePath}`)
      this.fileData = requireUncached(this.configFilePath) || {}
    } else {
      this.fileData = {}
    }
    debug(`configuration file data: ${JSON.stringify(this.fileData)}`)

    // the directory containing the source code
    this.sourceDir = process.cwd()
  }

  // Returns the value of the attribute with the given name
  get (attributeName :string) :string {
    return this.constructorArgs[attributeName] || this.fileData[attributeName] || defaultValues[attributeName]
  }

  // Creates a config file with default values
  createDefault () {
    fs.writeFileSync('./text-run.yml',
`# white-list for files to test
files: '**/*.md'

# the formatter to use
format: robust

# prefix that makes anchor tags active regions
classPrefix: 'tr_'

# whether to run the tests in an external temp directory,
# uses ./tmp if false,
# you can also provide a custom directory path here
useTempDirectory: false

# action-specific configuration
actions:
  runConsoleCommand:
    globals: {}`)
  }
}

module.exports = Configuration
