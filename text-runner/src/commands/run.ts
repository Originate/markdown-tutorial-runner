import * as color from "colorette"
import { extractActivities } from "../activity-list/extract-activities"
import { extractImagesAndLinks } from "../activity-list/extract-images-and-links"
import { instantiateFormatter } from "../configuration/instantiate-formatter"
import { getFileNames } from "../filesystem/get-filenames"
import { findLinkTargets } from "../link-targets/find-link-targets"
import { parseMarkdownFiles } from "../parsers/markdown/parse-markdown-files"
import { executeParallel } from "../runners/execute-parallel"
import { executeSequential } from "../runners/execute-sequential"
import { StatsCounter } from "../runners/helpers/stats-counter"
import { createWorkspace } from "../working-dir/create-working-dir"
import { ActionFinder } from "../actions/action-finder"
import { UserProvidedConfiguration } from "../configuration/types/user-provided-configuration"
import { loadConfiguration } from "../configuration/load-configuration"

/** executes "text-run run", prints everything, returns the number of errors encountered */
export async function runCommand(cmdlineArgs: UserProvidedConfiguration): Promise<number> {
  const originalDir = process.cwd()
  try {
    // step 1: load configuration from file
    const config = await loadConfiguration(cmdlineArgs)

    // step 2: create workspace
    if (!config.workspace) {
      config.workspace = await createWorkspace(config.useSystemTempDirectory)
    }

    // step 3: find files
    const filenames = await getFileNames(config)
    if (filenames.length === 0) {
      console.log(color.magenta("no Markdown files found"))
      return 0
    }
    const stats = new StatsCounter(filenames.length)

    // step 4: read and parse files
    const ASTs = await parseMarkdownFiles(filenames)

    // step 5: find link targets
    const linkTargets = findLinkTargets(ASTs)

    // step 6: find actions
    const actionFinder = ActionFinder.load(config.sourceDir)

    // step 7: extract activities
    const activities = extractActivities(ASTs, config.regionMarker)
    const links = extractImagesAndLinks(ASTs)
    if (activities.length + links.length === 0) {
      console.log(color.magenta("no activities found"))
      return 0
    }

    // step 8: execute the ActivityList
    const formatter = instantiateFormatter(config.formatterName, activities.length + links.length, config)
    process.chdir(config.workspace)
    const jobs = executeParallel(links, actionFinder, linkTargets, config, stats, formatter)
    jobs.push(executeSequential(activities, actionFinder, config, linkTargets, stats, formatter))
    const errors = await Promise.all(jobs)
    const errorCount = errors.reduce((acc, val) => acc + val, 0)

    // step 9: cleanup
    process.chdir(config.sourceDir)

    // step 10: write stats
    formatter.summary(stats)

    return errorCount
  } finally {
    process.chdir(originalDir)
  }
}
