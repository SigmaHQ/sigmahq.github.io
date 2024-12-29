import fs from 'node:fs'

export default {
  watch: ['./common_logsources.json'],
  load(watchedFiles) {
    // watchedFiles will be an array of absolute paths of the matched files.
    // generate an array of blog post metadata that can be used to render
    // a list in the theme layout
    return watchedFiles.map((file) => {
      return JSON.parse(fs.readFileSync(file, 'utf-8'))
    })
  }
}