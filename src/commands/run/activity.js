// @flow

import type {HandlerFunction} from './handler-function.js'
import type {AstNodeList} from '../../parsers/ast-node-list.js'
import type Configuration from '../../configuration/configuration.js'
import type Formatter from '../../formatters/formatter.js'
import type {LinkTargetList} from './link-target-list.js'
import type Searcher from './searcher.js'

// Activity is an activity type instance,
// i.e. a particular activity that we are going to do
// on a particular place in a particular document, defined by an activity type
export type Activity = {
  filename: string,
  startLine?: number,
  endLine?: number,
  formatter: Formatter,
  runner: HandlerFunction,
  nodes: AstNodeList,
  linkTargets: LinkTargetList,
  configuration: Configuration,
  searcher: Searcher
}
