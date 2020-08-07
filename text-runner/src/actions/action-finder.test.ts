import { assert } from "chai"
import { scaffoldActivity } from "../activity-list/types/activity"
import { ActionFinder, loadCustomActions } from "./action-finder"
import path from "path"

suite("actionFinder", function () {
  suite("actionFor()", function () {
    test("built-in block name", function () {
      const activity = scaffoldActivity({ actionName: "cd" })
      const actionFinder = new ActionFinder(".")
      assert.typeOf(actionFinder.actionFor(activity), "function")
    })
  })

  suite("loadCustomActions", function () {
    test("with text-run folder of this codebase", function () {
      const result = loadCustomActions(path.join(__dirname, "..", "..", "..", "documentation", "text-run"))
      assert.typeOf(result["verify-ast-node-attributes"], "function")
      assert.typeOf(result["verify-handler-args"], "function")
    })
  })
})
