import { ActionArgs } from "../types/action-args"
import path from "path"
import { callArgs } from "../helpers/call-args"
import { createObservableProcess } from "observable-process"
import stripAnsi from "strip-ansi"

/** runs Text-Runner in the workspace */
export default async function runTextRunner(action: ActionArgs) {
  // TODO: call an internal Text-Runner API here, see https://github.com/kevgo/text-runner/issues/903
  // TODO: call existing Text-Runner API here
  var textRunPath = path.join(action.configuration.sourceDir, "..", "text-runner", "bin", "text-run")
  if (process.platform === "win32") textRunPath += ".cmd"
  const trArgs = callArgs(textRunPath)
  trArgs[trArgs.length - 1] += " --keep-tmp"
  const processor = createObservableProcess(trArgs, { cwd: action.configuration.workspace })
  await processor.waitForEnd()
  if (processor.exitCode !== 0) {
    throw new Error(
      `text-run exited with code ${processor.exitCode} when processing this markdown block:\n${stripAnsi(
        processor.output.fullText()
      )}`
    )
  }
  // fs.rmdir(dir, { recursive: true })
}
