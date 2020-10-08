import { EventEmitter } from "events"
import * as util from "util"

import * as activities from "../activities/index"
import * as ast from "../ast"
import * as configuration from "../configuration/index"
import { UserError } from "../errors/user-error"
import * as events from "../events/index"
import * as files from "../filesystem/index"
import * as helpers from "../helpers"
import * as linkTargets from "../link-targets"
import * as parsers from "../parsers/index"
import { Command } from "./command"

export type DebugSubcommand = "activities" | "ast" | "images" | "links" | "linkTargets"

export class Debug implements Command {
  userConfig: configuration.PartialData
  subcommand: DebugSubcommand | undefined
  emitter: EventEmitter

  constructor(userConfig: configuration.PartialData, subcommand: DebugSubcommand | undefined) {
    this.userConfig = userConfig
    this.subcommand = subcommand
    this.emitter = new EventEmitter()
  }

  emit(name: events.Name, payload: events.Args): void {
    this.emitter.emit(name, payload)
  }

  async execute(): Promise<void> {
    const config = await configuration.backfillDefaults(this.userConfig)
    const filenames = await files.getFileNames(config)
    if (filenames.length !== 1) {
      const guidance = `Please tell me which file to debug

Example: text-run debug --${this.subcommand} foo.md`
      throw new UserError("no files specified", guidance)
    }
    const guidance = `possible subcommands are:
--activities: active regions
--ast: AST nodes
--images: embedded images
--links: embedded links
--link-targets: document anchors to link to

Example: text-run debug --images foo.md`
    const ASTs = await parsers.markdown.parse(filenames, config.sourceDir)
    switch (this.subcommand) {
      case "activities":
        return debugActivities(ASTs, config)
      case "ast":
        return debugASTNodes(ASTs)
      case "images":
        return debugImages(ASTs)
      case "links":
        return debugLinks(ASTs)
      case "linkTargets":
        return debugLinkTargets(ASTs)
      case undefined:
        throw new UserError("missing debug sub-command", guidance)
      default:
        throw new UserError(`unknown debug sub-command: ${this.subcommand}`, guidance)
    }
  }

  on(name: events.Name, handler: events.Handler): this {
    this.emitter.on(name, handler)
    return this
  }
}

function debugActivities(ASTs: ast.NodeList[], config: configuration.Data) {
  console.log("\nACTIVITIES:")
  const dynamicActivities = activities.extractDynamic(ASTs, config.regionMarker || "type")
  if (dynamicActivities.length === 0) {
    console.log("(none)")
  } else {
    for (const act of dynamicActivities) {
      console.log(`${act.file.platformified()}:${act.line}  ${act.actionName}`)
    }
  }
}

function debugASTNodes(ASTs: ast.NodeList[]) {
  console.log("AST NODES:")
  for (const AST of ASTs) {
    for (const node of AST) {
      console.log(`${node.file.platformified()}:${node.line}  ${node.type} ${showAttr(node)}`)
    }
  }
}

function debugImages(ASTs: ast.NodeList[]) {
  console.log("\nIMAGES:")
  const images = activities.extractImagesAndLinks(ASTs).filter(al => al.actionName === "check-image")
  if (images.length === 0) {
    console.log("(none)")
    return
  }
  for (const image of images) {
    image.document = new ast.NodeList()
    console.log(helpers.trimAllLineEnds(util.inspect(image, false, Infinity)))
  }
}

function debugLinks(ASTs: ast.NodeList[]) {
  console.log("\nLINKS:")
  const links = activities.extractImagesAndLinks(ASTs).filter(al => al.actionName === "check-link")
  if (links.length === 0) {
    console.log("(none)")
    return
  }
  for (const image of links) {
    image.document = new ast.NodeList()
    console.log(helpers.trimAllLineEnds(util.inspect(image, false, Infinity)))
  }
}

function debugLinkTargets(ASTs: ast.NodeList[]) {
  console.log("\nLINK TARGETS:")
  const targets = linkTargets.find(ASTs)
  for (const key of Object.keys(targets.targets)) {
    console.log(key, targets.targets[key])
  }
}

function showAttr(node: ast.Node): string {
  if (node.type === "text") {
    return `("${node.content.trim()}")`
  }
  const keys = Object.keys(node.attributes)
  if (keys.length === 0) {
    return ""
  }
  return `(${node.attributes.type})`
}
