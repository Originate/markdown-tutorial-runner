import color from "colorette"
import fs from "fs-extra"
import path from "path"
import { ActionArgs } from "../runners/action-args"

export default async function createFile(args: ActionArgs) {
  const filePath = args.nodes.textInNodeOfType("em", "strong")
  const content = args.nodes.textInNodeOfType("fence", "code")
  args.formatter.name(`create file ${color.cyan(filePath)}`)
  const fullPath = path.join(args.configuration.workspace, filePath)
  args.formatter.log(`create file ${fullPath}`)
  await fs.ensureDir(path.dirname(fullPath))
  await fs.writeFile(fullPath, content)
}
