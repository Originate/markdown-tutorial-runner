import { pretendToUse } from "../../helpers/pretend-to-use"
import { ActionArgs } from "../action-args"

// Runs the JavaScript code given in the code block
export default function validateJavascript(args: ActionArgs) {
  const code = args.nodes.textInNodeOfType("fence")
  args.formatter.log(code)
  try {
    new Function(code)
  } catch (e) {
    throw new Error(`invalid Javascript: ${e.message}`)
  }
}
