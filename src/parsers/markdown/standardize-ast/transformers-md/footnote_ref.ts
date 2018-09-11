import AbsoluteFilePath from "../../../../domain-model/absolute-file-path"
import pretendToUse from "../../../../helpers/pretend-to-use"
import AstNodeList from "../../../ast-node-list"
import AstNode from "../../../ast-node"
import OpenTagTracker from "../../helpers/open-tag-tracker"

export default function(
  node: any,
  openTags: OpenTagTracker,
  file: AbsoluteFilePath,
  line: number
): AstNodeList {
  const result = new AstNodeList()
  const resultNode = new AstNode({
    attributes: {},
    content: "",
    file,
    line,
    tag: "footnote_ref",
    type: node.type
  })
  result.pushNode(resultNode)
  pretendToUse(openTags)
  return result
}
