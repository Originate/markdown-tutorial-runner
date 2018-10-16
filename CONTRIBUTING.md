# TextRunner Developer Documentation

## Installation for development

- you need to have Gnu Make installed - running `make` should work on your machine
- run <code textrun="verify-make-command">make setup</code> to install all needed software and libraries on your computer
- add `./bin` and `./node_modules/.bin` to your PATH

## Testing

- run all tests: <code textrun="verify-make-command">make spec</code>
- run feature specs: <code textrun="verify-make-command">make cuke</code>
- run feature specs in offline mode: <code textrun="verify-make-command">make cuke --tags '~@online'</code>
- run text-run: <code textrun="verify-make-command">make docs</code>

To debug a single test:

- enable console output: add the `@verbose` tag
- enable debugging statements and verbose output: add the `@debug` tag

To determine test coverage, run <a textrun="verify-make-command">make coverage</code></a>.
The coverage in relatively low because TextRunner contains copious amounts of
defensive checks against invalid user input.
Not all permutations of that are tested.

## Linting

- run all linters: <a textrun="verify-make-command">make lint</code></a>
- run JavaScript linters: <a textrun="verify-make-command">make lintjs</code></a>
- run Markdown linters: <a textrun="verify-make-command">make lintmd</code></a>

* run all linters: <a textrun="does-make-target-exist">`make lint`</a>
* run JavaScript linters: <a textrun="does-make-target-exist">`make lintjs`</a>
* run Markdown linters: <a textrun="does-make-target-exist">`make lintmd`</a>

## Editor setup

Set up your editor with the following configuration:

- linters: run `flow`, then `standard`
- fixers: run `prettier_standard`
  (which runs [Prettier](https://github.com/prettier/prettier),
  then [StandardJS](https://standardjs.com)

Vim users can use this configuration option for [Ale](https://github.com/w0rp/ale):

```vim
let g:ale_linters = {
\   'javascript': ['flow', 'standard']
\}
let g:ale_fixers = {
\   'javascript': ['prettier_standard']
\}
let g:ale_javascript_prettier_use_local_config = 1
```

## Terminology

TextRunner runs _active documentation_, i.e. documentation that can be executed.
Active documentation is normal documentation
that contains _active blocks_.
Active blocks are regions of text wrapped in an _activation expression_.
The default activation expression is a `textrun` attribute on any HTML tag,
defining the _activity_ that should be executed using the content inside the
respective active block.
TextRunner comes with built-in activities,
for example to create files or directories, verify file contents,
or start external processes.
You can also create your own _custom activities_
by providing a file with the activity name in the `text-run` directory
of your code base, which exports a function that runs the activity.
This function is called the `action` of the activity.

Said another way, writers can perform activities through active documenation.
Each activity has a name, an action, and a bunch of associated nodes from the document.

## Architecture

The architecture is best understood by following along
with how a set of documents is tested.
There are several CLI executables to start TextRunner:

- [bin/text-run](bin/text-run) for unix-like systems and macOS
- [bin/text-run.cmd](bin/text-run.cmd) for Windows

These CLI executables call the [cli.ts](src/cli/cli.ts) CLI module.
The CLI subsystem parses the command-line arguments
and calls TextRunner's [JavaScript API](src/text-runner.ts).
This API is located in the file [src/text-runner.ts](src/text-runner.ts)
and also Text-Runner's core.

The core asks the [configuration](src/configuration)
module for the current [configuration](src/configuration/configuration.ts)
settings coming from command-line arguments and/or configuration files.
The configuration structure tells TextRunner the command to run.
Commands are stored in the [commands](src/commands) folder.
The most important command is [run](src/commands/run.ts),
there are others like [help](src/commands/help.ts),
[setup](src/commands/setup.ts), or [version](src/commands/version.ts).

The [run command](src/commands/run.ts) has a functional architecture
that converts the configuration into test results over several steps:

1. **configuration --> list of Markdown files to test:**
   this is done by the [finding files module](src/finding-files)
1. **list of filenames --> list of file ASTs:**
   the [parse module](src/parsers) reads and parses each file
   and [transforms](src/parsers/markdown/standardize-ast)
   the parser output into a standardized AST format
   that is similar whether the input is Markdown or HTML
   and optimized for analyzing and testing.
1. **list of ASTs --> list of tests steps to execute:**
   the [activities module](src/activity-list)
   finds _active blocks_ in the ASTs and gathers all the related information.
   The output of this step is several lists:
   parallelizable tests like checking static file and image links
   and sequential tests that have to run one after the other.
1. **list of test steps --> list of test results:**
   the [runner module](src/runners) executes the test steps given to it
   and writes test progress to the console
   via the configured [formatter](src/formatters).
   Each test step gets their own formatter instance,
   this ensures concurrency:
   the formatter collects all the output of that test step
   then prints it as a block when the test step is done.
1. **test results --> test statistics:**
   finally, we write a summary of the test to the console
   and terminate with the corresponding exit code.

## Deployment

- update the version in [package.json](package.json) in a branch and ship it
- create a new release on Github
- run <code textrun="verify-make-command">make deploy</code>
