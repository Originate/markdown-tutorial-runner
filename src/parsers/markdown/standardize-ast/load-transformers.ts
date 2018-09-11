import { TransformerList } from "../standardize-ast/transformer-list"

import fs from "fs-extra"
import path from "path"

export default function loadTransformers(type: string): TransformerList {
  const result = {}
  const dir = path.join(__dirname, `transformers-${type}`)
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const transformer = require(path.join(dir, file))
    result[path.basename(file, ".js")] = transformer
  }
  return result
}
