import chalk from "chalk"
import Formatter from "./formatter"
import path from "path"
import printCodeFrame from "../helpers/print-code-frame"

export default class DotFormatter extends Formatter {
  // A minimalistic formatter, prints dots for each check

  error(errorMessage: string) {
    this.registerError()
    console.log()
    console.log(chalk.dim(this.output))
    process.stdout.write(
      chalk.red(
        `${this.activity.file.platformified()}:${this.activity.line} -- `
      )
    )
    console.log(errorMessage)
    printCodeFrame(
      console.log,
      path.join(this.sourceDir, this.activity.file.platformified()),
      this.activity.line
    )
  }

  skip(message: string) {
    this.registerSkip()
    process.stdout.write(chalk.cyan("."))
  }

  success() {
    super.success()
    process.stdout.write(chalk.green("."))
  }

  warning(warningMessage: string) {
    this.registerWarning()
    process.stdout.write(chalk.magenta("."))
  }
}
