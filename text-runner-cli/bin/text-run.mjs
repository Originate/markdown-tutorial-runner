#!/usr/bin/env node

import { main } from "../dist/index.js"

main().catch(function(e) {
  throw e
})
