require! {
  'fs-extra' : fs
  'mkdirp'
  'path'
}


module.exports = ->

  @Given /^a broken file "([^"]*)"$/ (file-path) ->
    if (subdir = path.dirname file-path) isnt '.'
      mkdirp.sync path.join(@root-dir.name, subdir)
    fs.write-file-sync path.join(@root-dir.name, file-path), """
      <a href="missing">
      </a>
      """


  @Given /^a runnable file "([^"]*)"$/ (file-path) ->
    fs.mkdir-sync path.join @root-dir.name, subdir if (subdir = path.dirname file-path) isnt '.'
    fs.write-file-sync path.join(@root-dir.name, file-path), """
      <a class="tutorialRunner_createFile">
      __one.txt__

      ```
      Hello world!
      ```
      </a>
      """


  @Given /^I am in a directory that contains the "([^"]*)" example with the configuration file:$/ (example-name, config-file-content) ->
    fs.copy-sync path.join('examples' example-name), @root-dir.name
    fs.write-file-sync path.join(@root-dir.name, 'tut-run.yml'), config-file-content


  @Given /^I am in a directory that contains the "([^"]*)" example(?: without a configuration file)$/ (example-name) ->
    fs.copy-sync path.join('examples' example-name), @root-dir.name


  @Given /^I am in a directory that contains the "([^"]*)" example$/ (example-name) ->
    fs.copy-sync path.join('examples' example-name), @root-dir.name


  @Given /^my tutorial is starting the "([^"]*)" example$/ (example) ->
    fs.write-file-sync path.join(@root-dir.name, '0.md'), """
      <a class="tutorialRunner_startConsoleCommand">
      ```
      node #{path.join __dirname, '..' '..' 'examples' 'long-running' 'server.js'}
      ```
      </a>
      """


  @Given /^my workspace contains a directory "([^"]*)"$/ (dir) ->
    fs.mkdir-sync path.join(@root-dir.name, dir)


  @Given /^my workspace contains an image "([^"]*)"$/ (image-name, done) ->
    fs.mkdir path.join(@root-dir.name, path.dirname(image-name)), (err) ~>
      cp path.join(__dirname, path.basename(image-name)),
         path.join(@root-dir.name, image-name)
      done!


  @Given /^the configuration file:$/ (content) ->
    fs.write-file-sync path.join(@root-dir.name, 'tut-run.yml'), content


  @Given /^my workspace contains the file "([^"]*)" with the content:$/ (file-name, content, done) ->
    fs.mkdir path.join(@root-dir.name, path.dirname(file-name)), (err) ~>
      fs.write-file-sync path.join(@root-dir.name, file-name), content
      done!


  @Given /^my workspace contains a tutorial$/ ->
    fs.write-file-sync path.join(@root-dir.name, '1.md'), '''
      <a class="tutorialRunner_runConsoleCommand">
      ```
      echo "Hello world"
      ```
      </a>
    '''


  @Given /^my tut\-run configuration contains:$/ (text) ->
    fs.append-file-sync path.join(@root-dir.name, 'tut-run.yml'), "\n#{text}"


  @Given /^my workspace contains an empty file "([^"]*)"$/ (file-name) ->
    fs.write-file-sync path.join(@root-dir.name, file-name), ''


  @Given /^the test directory contains the file "([^"]*)" with the content:$/ (file-name, content) ->
    fs.write-file-sync path.join(@root-dir, file-name), content



