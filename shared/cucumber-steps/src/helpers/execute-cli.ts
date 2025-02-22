import * as observableProcess from "observable-process"

import { TRWorld } from "../world.js"
import { makeFullPath } from "./make-full-path.js"
import * as workspace from "./workspace.js"

/** Executes the given command in a subshell. */
export async function executeCLI(
  command: string,
  expectError: boolean,
  world: TRWorld,
  opts: { cwd?: string } = {}
): Promise<observableProcess.FinishedProcess> {
  const args: observableProcess.StartOptions = {}
  args.cwd = opts.cwd || workspace.absPath.platformified()
  if (world.debug) {
    args.env = {
      DEBUG: "*,-babel",
      PATH: process.env.PATH,
    }
  }
  const fullCommand = makeFullPath(command, process.platform)
  const runner = observableProcess.start(fullCommand, args)
  const runResult = (await runner.waitForEnd()) as observableProcess.FinishedProcess
  if (runResult.exitCode && !expectError) {
    // unexpected failure
    console.log("UNEXPECTED TEST FAILURE\n")
    console.log("OUTPUT START")
    console.log(runner.output.fullText())
    console.log("OUTPUT END")
    throw new Error(`Expected success but got exit code: ${runResult.exitCode}`)
  }
  if (expectError && !runResult.exitCode) {
    // expected failure didn't occur
    throw new Error("expected error but test succeeded")
  }
  return runResult
}
