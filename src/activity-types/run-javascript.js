// @flow

import type { Activity } from '../commands/run/activity.js'
import type Configuration from '../configuration/configuration.js'

type DoneFunction = (err?: ?ErrnoError) => void

// Runs the JavaScript code given in the code block
module.exports = function (activity: Activity, done: DoneFunction) {
  var code = activity.searcher.tagContent('fence')
  if (code == null) {
    done(new Error('no JavaScript code found in the fenced block'))
    return
  }
  code = replaceSubstitutionsInConfiguration(code, activity.configuration)
  code = replaceRequireLocalModule(code)
  code = replaceVariableDeclarations(code)

  // This is used in an eval'ed string below
  /* eslint-disable no-unused-vars */
  const __finished = err => {
    done(err)
  }

  if (hasCallbackPlaceholder(code)) {
    // async code
    code = replaceAsyncCallbacks(code)
  } else {
    // sync code
    code = appendAsyncCallback(code)
  }
  activity.formatter.output(code)
  /* eslint-disable no-eval */
  eval(code)
}

function appendAsyncCallback (code: string): string {
  return `${code.trim()};\n__finished()`
}

function replaceAsyncCallbacks (code: string): string {
  return code
    .replace('<CALLBACK>', '__finished')
    .replace(/\/\/\s*\.\.\./g, '__finished()')
}

// substitutes replacements configured in text-run.yml
function replaceSubstitutionsInConfiguration (
  code: string,
  configuration: Configuration
): string {
  try {
    // $FlowFixMe: we can ignore undefined values here since `code` has a default value
    for (let replaceData of configuration.fileData.actions.runJavascript
      .replace) {
      code = code.replace(replaceData.search, replaceData.replace)
    }
  } catch (e) {
    // ignoring type errors here since `code` has a default value
  }
  return code
}

// makes sure "require('.') works as expected even if running in a temp workspace
function replaceRequireLocalModule (code: string): string {
  return code.replace(/require\(['"].['"]\)/, 'require(process.cwd())')
}

// make variable declarations persist across code blocks
function replaceVariableDeclarations (code: string): string {
  return code
    .replace(/\bconst /g, 'global.')
    .replace(/\bvar /g, 'global.')
    .replace(/\bthis\./g, 'global.')
}

// returns whether the given code block contains a callback placeholder
function hasCallbackPlaceholder (code): boolean {
  return code.indexOf('<CALLBACK>') > -1 || code.indexOf('// ...') > -1
}
