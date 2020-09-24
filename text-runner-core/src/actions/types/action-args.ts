import * as config from "../../configuration/index"
import { LinkTargetList } from "../../link-targets/link-target-list"
import * as parsers from "../../parsers"
import * as runners from "../../runners"

export interface ActionArgs {
  /** TextRunner configuration data derived from the config file and CLI switches */
  configuration: config.Data

  /** the AST nodes of the active region which the current action tests */
  region: parsers.ast.NodeList

  /** the AST nodes of the active region which the current action tests */
  document: parsers.ast.NodeList

  /** name of the file in which the currently tested active region is */
  file: string

  /** line in the current file at which the currently tested active region starts */
  line: number

  /** allows printing test output to the user, behaves like console.log */
  log: runners.LogFn

  /**
   * Name allows to provide a more specific name for the current action.
   *
   * As an example, the generic step name `write file` could be refined to
   * `write file "foo.yml"` once the name of the file to be written
   * has been extracted from the document AST.
   */
  name: runners.RefineNameFn

  /** all link targets in the current documentation  */
  linkTargets: LinkTargetList

  /** return the action with this value to signal that it is being skipped */
  SKIPPING: 254
}
