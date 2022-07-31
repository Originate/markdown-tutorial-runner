import * as color from "colorette"
import * as fs from "fs-extra"
import * as tr from "text-runner-core"

import { trimDollar } from "../helpers/trim-dollar"
import { PackageJson } from "./package-json"

export async function install(action: tr.actions.Args): Promise<void> {
  const installText = trimDollar(action.region.text())
  if (installText === "") {
    throw new Error("no installation instructions found")
  }
  action.name(`check npm package name in ${color.cyan(installText)}`)

  const dir = action.region[0]?.attributes?.dir || ""
  const pkgJsonText = await fs.readFile(action.configuration.sourceDir.joinStr(dir, "package.json"), "utf8")
  const pkgJson: PackageJson = JSON.parse(pkgJsonText)

  if (missesPackageName(installText, pkgJson.name)) {
    throw new Error(
      `installation instructions ${color.cyan(installText)} don't contain expected npm package name ${color.cyan(
        pkgJson.name
      )}`
    )
  }
}

function missesPackageName(installText: string, packageName: string): boolean {
  // Note: cannot use minimist here
  //       because it is too stupid to understand
  //       that NPM uses '-g' by itself, and not as a switch for the argument after it
  return (
    installText
      .split(" ")
      .map(word => word.trim())
      .filter(word => word === packageName).length === 0
  )
}
