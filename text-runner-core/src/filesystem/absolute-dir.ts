import * as path from "path"

import * as helpers from "../helpers"

/**
 * represents an absolute path to a directory,
 * i.e. path from filesystem root to the directory
 */
export class AbsoluteDir {
  value: string

  constructor(value: string) {
    this.value = helpers.unixify(value)
  }

  /** provides a path of this directory with the given path appended */
  joinStr(file: string): string {
    return path.join(this.platformified(), file)
  }

  /**
   * Returns the path in the platform-specific format,
   * i.e. using '\' on Windows and '/' everywhere else
   */
  platformified(): string {
    return this.value.replace(/\//g, path.sep)
  }

  /**
   * Returns this absolute path using forward slashes as path separators
   */
  unixified(): string {
    return this.value
  }
}
