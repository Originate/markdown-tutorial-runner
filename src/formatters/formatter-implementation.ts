import { DetailedFormatter } from "./detailed-formatter"
import { DotFormatter } from "./dot-formatter"
import { ProgressFormatter } from "./progress-formatter"

/** FormatterImplemention represents all classes that implement the Formatter interface */
export type FormatterImplemention =
  | typeof DetailedFormatter
  | typeof DotFormatter
  | typeof ProgressFormatter
// HACK: rather than enumerating all concrete classes here,
//       do this via type system metaprogramming
