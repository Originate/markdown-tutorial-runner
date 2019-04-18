import { Configuration } from '../configuration/configuration'

import chalk from 'chalk'
import { extractActivities } from '../activity-list/extract-activities'
import { getFileNames } from '../finding-files/get-filenames'
import { readAndParseFile } from '../parsers/read-and-parse-file'
import { actionRepo } from '../runners/action-repo'

export async function unusedCommand(config: Configuration): Promise<Error[]> {
  // step 1: find files
  const filenames = await getFileNames(config)
  if (filenames.length === 0) {
    console.log(chalk.magenta('no Markdown files found'))
    return []
  }

  // step 2: read and parse files
  const ASTs = await Promise.all(filenames.map(readAndParseFile))

  // step 3: extract activities
  const usedActionNames = extractActivities(ASTs, config.classPrefix).map(
    activity => activity.type
  )

  // step 4: find defined activities
  const definedActionNames = actionRepo.customActionNames()

  // step 5: identify unused activities
  const unusedActionNames = determineUnusedActions(
    definedActionNames,
    usedActionNames
  )

  // step 6: write stats
  console.log('Unused actions:')
  for (const unusedActionName of unusedActionNames) {
    console.log(`- ${unusedActionName}`)
  }

  return []
}

function determineUnusedActions(
  definedActionNames: string[],
  usedActionNames: string[]
): string[] {
  const result: string[] = []
  for (const definedActionName of definedActionNames) {
    if (!usedActionNames.includes(definedActionName)) {
      result.push(definedActionName)
    }
  }
  return result
}
