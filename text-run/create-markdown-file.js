const fs = require('fs')
const path = require('path')

module.exports = async function(args) {
  const markdown = args.nodes.textInNodeOfType('fence').replace(/​/g, '')
  await fs.writeFile(path.join(args.configuration.workspace, '1.md'), markdown)
}
