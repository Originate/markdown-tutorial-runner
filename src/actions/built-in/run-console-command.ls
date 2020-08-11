require! {
  '../../helpers/call-args'
  'chalk' : {bold, cyan, red}
  'observable-process' : ObservableProcess
  'path'
  'prelude-ls' : {compact, find, head, map, tail, values}
  '../../helpers/trim-dollar'
  'xml2js'
}
debug = require('debug')('console-with-dollar-prompt-runner')


# Runs the given commands on the console.
# Waits until the command is finished.
module.exports  = ({configuration, formatter, searcher}, done) ->
  formatter.start 'running console command'

  commands-to-run = searcher.node-content type: 'fence', ({content, nodes}) ->
    | nodes.length is 0  =>  'no code blocks found'
    | nodes.length > 1   =>  "found #{nodes.length} fenced code blocks. Expecting only one."
    | !content  =>  'the block that defines console commands to run is empty'
  |> (.split '\n')
  |> map (.trim!)
  |> compact
  |> map trim-dollar
  |> map make-global(configuration?.file-data?.actions?.run-console-command?.globals)
  |> (.join ' && ')

  input-text = searcher.node-content type: 'htmlblock'
  get-input input-text, formatter, (input) ->
    formatter.refine "running console command: #{bold cyan commands-to-run}"
    process = new ObservableProcess(call-args(commands-to-run),
                                    cwd: configuration.test-dir,
                                    stdout: formatter.stdout,
                                    stderr: formatter.stderr)
      ..on 'ended', (err) ~>
        | err  =>  formatter.error err
        | _    =>  formatter.success!
        done err

    for input-line in input
      enter process, input-line


function enter process, {text-to-wait = '', input}
  process.wait text-to-wait, ->
    process.enter input


function get-input text, formatter, done
  if !text then return done ''
  xml2js.parse-string text, (err, xml) ->
    | err  =>  return formatter.error err
    result = for tr in xml.table.tr
      if tr.td
        if tr.td.length is 1
          text-to-wait: null, input: tr.td[0]
        else
          text-to-wait: tr.td[0], input: tr.td[*-1]
    done result


function make-global globals = {}
  (command) ->
    command-parts = command.split ' '
    if replacement = globals[head command-parts]
      "#{path.join process.cwd!, replacement} #{tail(command-parts).join ' '}"
    else
      command
