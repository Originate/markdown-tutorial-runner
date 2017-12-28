# Built-in Actions

TextRunner provides a number of built-in actions
for activities typically performed in software documentation.


## Filesystem

All file system actions happen inside a special directory called the _workspace_.
This directory is located in `./tmp` unless [configured otherwise](#configuration).

* [change the current working directory](documentation/actions/cd.md)
* [create a directory](documentation/actions/create_directory.md)
* [create a file](documentation/actions/create_file.md)
* [verify a directory exists](documentation/actions/verify_workspace_contains_directory.md)
* [verify a file with given name and content exists](documentation/actions/verify_workspace_file_content.md)


## Verify the Git repo that contains the documentation

* [display the content of a file in the Git repo](documentation/actions/verify_source_file_content.md)
* [link to a directory in the Git repo](documentation/actions/verify_source_contains_directory.md)


## Console commands

Console commands also happen in TextRunner's [workspace directory](#filesystem).
* [run a console command](documentation/actions/run_console_command.md)
* [start and stop long-running console commands](documentation/actions/start_stop_console_command.md)
* [verify the output of the last console command](documentation/actions/verify_run_console_command_output.md)


## Running source code

* [run Javascript code](documentation/actions/run_javascript.md)


## Other actions

* [required NodeJS version](documentation/actions/minimum-node-version.md)
* [verify NPM installation instructions](documentation/actions/verify_npm_install.md)
* [verify global command provided by NPM module](documentation/actions/verify_npm_global_command.md)

With the option `--fast` given, text-run does not check outgoing links to other websites.


<hr>

Read more about:
- writing your own [user-defined actions](user-defined-actions.md)
