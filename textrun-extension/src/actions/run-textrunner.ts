import * as path from "path"
import { ActionArgs } from "text-runner-core"
import { createObservableProcess } from "observable-process"
import { callArgs } from "../helpers/call-args"

/** runs Text-Runner in the workspace */
export async function runTextrunner(action: ActionArgs) {
  // TODO: call an internal Text-Runner API here, see https://github.com/kevgo/text-runner/issues/903
  // TODO: call existing Text-Runner API here
  var textRunPath = path.join(action.configuration.sourceDir, "node_modules", ".bin", "text-run")
  if (process.platform === "win32") textRunPath += ".cmd"
  const trArgs = callArgs(textRunPath, process.platform)
  const processor = createObservableProcess(trArgs, { cwd: action.configuration.workspace })
  await processor.waitForEnd()
  action.log(processor.output.fullText())
  if (processor.exitCode !== 0) {
    throw new Error(`the nested Text-Runner instance exited with code ${processor.exitCode}`)
  }
}
