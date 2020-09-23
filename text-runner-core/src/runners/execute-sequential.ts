import { ActivityList } from "../activities/index"
import * as configuration from "../configuration/index"
import { LinkTargetList } from "../link-targets/link-target-list"
import { runActivity } from "./run-activity"
import * as actions from "../actions"
import * as commands from "../commands/index"

export async function executeSequential(
  activities: ActivityList,
  actionFinder: actions.Finder,
  configuration: configuration.Data,
  linkTargets: LinkTargetList,
  emitter: commands.Command
): Promise<void> {
  for (const activity of activities) {
    const abort = await runActivity(activity, actionFinder, configuration, linkTargets, emitter)
    if (abort) {
      return
    }
  }
}
