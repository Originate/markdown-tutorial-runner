require! {
  '../dist/helpers/call-args'
  'chalk' : {strip-color}
  'dim-console'
  '../dist/helpers/call-args'
  'fs'
  'observable-process' : ObservableProcess
  'path'
  'touch'
  '../src/tutorial-runner' : TutorialRunner
}


module.exports  = ({configuration, formatter, searcher}, done) ->
  formatter.start 'verify that markdown works in tut-run'

  markdown = searcher.node-content type: 'fence', ({content, nodes}) ->
    | nodes.length > 1   =>  "Found #{nodes.length} fenced code blocks. Only one is allowed."
    | nodes.length is 0  =>  'You must provide the Markdown to run via tut-run as a fenced code block. No such fenced block found.'
    | !content  =>  'A fenced code block containing the Markdown to run was found, but it is empty, so I cannot run anything here.'

  fs.write-file-sync path.join(configuration.test-dir, '1.md'), markdown.replace /​/g, ''

  tut-run-path = path.join __dirname, '..' 'bin' 'tut-run'
  if process.platform is 'win32' then tut-run-path += '.cmd'
  new ObservableProcess call-args(tut-run-path), cwd: configuration.test-dir, stdout: {write: formatter.output}, stderr: {write: formatter.output}
    ..on 'ended', (exit-code) ~>
      | exit-code is 0  =>  formatter.success!
      | otherwise       =>  formatter.error "tut-run exited with code #{exit-code} when processing this markdown block"
      done exit-code, 1
