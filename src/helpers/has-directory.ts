import fs from 'fs-extra'

export default async function hasDirectory(dirname: string): boolean {
  try {
    const stats = await fs.stat(dirname)
    return stats.isDirectory()
  } catch (e) {
    return false
  }
}
