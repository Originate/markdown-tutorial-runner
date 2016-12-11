require! {
  'chai' : {expect}
  'dim-console'
  'observable-process' : ObservableProcess
  'path'
}


CliWorld = !->

  @execute = ({command, formatter}, done) ->
    args =
      cwd: @root-dir.name
      stdout: off
      stderr: off
      env: {}
    if @verbose
      args.stdout = dim-console.process.stdout
      args.stderr = dim-console.process.stderr
    else
      args.stdout = write: (text) ~> @output += text
      args.stderr = write: (text) ~> @output += text
    if @debug
      args.env['DEBUG'] = '*'
    path-segments = [path.join(process.cwd!, 'bin', 'tut-run')]
    if formatter
      path-segments
        ..push '--format'
        ..push formatter
    path-segments.push command
    @process = new ObservableProcess path-segments, args
      ..on 'ended', (@exit-code) ~>
        @output = dim-console.output if @verbose
        done!


  @verify-call-error = (expected-error) ->
    output = @process.full-output!
    expect(output).to.include expected-error
    expect(@exit-code).to.equal 1


  @verify-failure = (table) ->
    output = @process.full-output!
    expected-header = switch
      | table.FILENAME and table.LINE  =>  "#{table.FILENAME}:#{table.LINE}"
      | table.FILENAME                 =>  "#{table.FILENAME}"
      | _                              =>  ''
    if table['MESSAGE']
      expected-header += " -- #{table['MESSAGE']}"
    expect(output).to.include expected-header
    expect(output).to.include table['ERROR MESSAGE']
    expect(@exit-code).to.equal +table['EXIT CODE']


  @verify-output = (table) ->
    expected-text = ""
    expected-text += table.FILENAME if table.FILENAME
    expected-text += ":#{table.LINE}" if table.FILENAME and table.LINE
    expected-text += ' -- ' if table.FILENAME and (table.MESSAGE or table.WARNING)
    expected-text += table.MESSAGE if table.MESSAGE
    expected-text += table.WARNING if table.WARNING
    expect(@process.full-output!).to.include expected-text


  @verify-printed-usage-instructions = ->
    expect(@process.full-output!).to.include 'COMMANDS'


  @verify-prints = (expected-text) ->
    expect(@process.full-output!).to.include expected-text


  @verify-ran-console-command = (command, done) ->
    expect(@process.full-output!).to.include "running.md:1-5 -- running console command: #{command}"
    done!


  @verify-tests-run = (count) ->
    expect(@process.full-output!).to.include " #{count} steps"

  @verify-unknown-command = (command) ->
    expect(@process.full-output!).to.include "unknown command: #{command}"


module.exports = ->
  @World = CliWorld if process.env.EXOSERVICE_TEST_DEPTH is 'CLI'
