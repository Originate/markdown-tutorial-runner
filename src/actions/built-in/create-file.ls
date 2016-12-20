require! {
  'chalk' : {cyan}
  'fs'
  'mkdirp'
  'path'
  'prelude-ls' : {capitalize, filter, map}
}


module.exports  = ({configuration, formatter, searcher}, done) ->
  formatter.start "creating file"

  file-path = searcher.node-content type: 'strongtext', ({nodes, content}) ->
    | nodes.length is 0  =>  'no path given for file to create'
    | nodes.length > 1   =>  "several file paths found: #{nodes |> map (.content) |> map ((a) -> cyan a) |> (.join ' and ')}"
    | !content           =>  'no path given for file to create'

  content = searcher.node-content type: 'fence', ({nodes, content}) ->
    | nodes.length is 0  =>  'no content given for file to create'
    | nodes.length > 1   =>  'found multiple content blocks for file to create, please provide only one'
    | !content           =>  'no content given for file to create'

  formatter.refine "creating file #{cyan file-path}"
  full-path = path.join(configuration.test-dir, file-path)
  mkdirp path.dirname(full-path), (err) ->
    | err  =>  return done err
    fs.write-file full-path, content, (err) ~>
      | err  =>  formatter.error err
      | _    =>  formatter.success!
      done!
