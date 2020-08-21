import { ActionArgs } from "text-runner"
import { appendAsyncCallback } from "../helpers/append-async-callback"
import { replaceAsyncCallback } from "../helpers/replace-async-callback"
import { replaceRequireLocalModule } from "../helpers/replace-require-local-module"
import { replaceVariableDeclarations } from "../helpers/replace-variable-declarations"
import { hasCallbackPlaceholder } from "../helpers/has-callback-placeholder"

type DoneFunction = (err?: Error) => void

/** The "runJavascript" action runs the JavaScript code given in the code block. */
export function run(action: ActionArgs, done: DoneFunction) {
  action.name("run JavaScript")
  let code = action.region.text()
  if (code === "") {
    done(new Error("no JavaScript code found"))
    return
  }
  code = replaceRequireLocalModule(code)
  code = replaceVariableDeclarations(code)

  // This is used in an eval'ed string below
  // @ts-ignore: unused variable
  // TODO: simplify to = done
  const __finished = (err: any) => {
    done(err)
  }

  // TODO: change to normal if clause
  code = hasCallbackPlaceholder(code)
    ? replaceAsyncCallback(code) // async code
    : appendAsyncCallback(code) // sync code
  eval(code)
}
