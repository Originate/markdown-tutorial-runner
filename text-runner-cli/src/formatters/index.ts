import { Stats } from "../helpers/stats-collector"
import * as tr from "text-runner-core"
import { DetailedFormatter } from "./detailed-formatter"
import { DotFormatter } from "./dot-formatter"
import { ProgressFormatter } from "./progress-formatter"
import { SummaryFormatter } from "./summary-formatter"
import * as events from "events"
import * as color from "colorette"

/** Names defines the names of all built-in formatters */
export type Names = "detailed" | "dot" | "progress" | "silent" | "summary"

/** Formatter defines the interface that Formatters must implement. */
export interface Formatter {
  finish(args: FinishArgs): void
}

/** FinishArgs defines the arguments provided to the `finish` method. */
export interface FinishArgs {
  stats: Stats
}

/** creates an instance of the formatter with the given name */
export function instantiate(name: Names, sourceDir: string, emitter: events.EventEmitter): Formatter {
  switch (name) {
    case "dot":
      return new DotFormatter(sourceDir, emitter)
    case "detailed":
      return new DetailedFormatter(sourceDir, emitter)
    case "progress":
      return new ProgressFormatter(sourceDir, emitter)
    case "summary":
      return new SummaryFormatter(sourceDir, emitter)
    default:
      throw new tr.UserError(`Unknown formatter: ${name}`, "Available formatters are: detailed, dot, progress, summary")
  }
}

export function printSummary(stats: Stats) {
  let text = "\n"
  let colorFn: color.Style
  if (stats.errorCount === 0) {
    colorFn = color.green
    text += color.green("Success! ")
  } else {
    colorFn = color.red
    text += color.red(`${stats.errorCount} errors, `)
  }
  text += colorFn(`${stats.activityCount} activities, ${stats.duration}`)
  console.log(color.bold(text))
}
