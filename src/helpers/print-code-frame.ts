import fs from "fs"
import { codeFrameColumns } from "@babel/code-frame"

type PrintFunc = (arg: string) => void | boolean

export default function(
  output: PrintFunc,
  filename: string | undefined,
  line: number | undefined
) {
  if (!filename || line == null) return

  const fileContent = fs.readFileSync(filename, "utf8")
  output(
    codeFrameColumns(
      fileContent,
      { start: { line: line } },
      { forceColor: true }
    )
  )
}
