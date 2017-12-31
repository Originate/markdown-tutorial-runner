# TextRunner Developer Documentation

## Installation for development

* `npm install`
* add `./bin` and `./node_modules/.bin` to your PATH


## Testing

* run all tests: `bin/spec`
* run feature specs: `bin/features`
* run feature specs against the JS API: `bin/cuke-api`
* run feature specs against the CLI: `bin/cuke-cli`
* run feature specs against the CLI in offline mode: `bin/cuke-cli --tags '~@online'`
* run text-run: `bin/docs`

To debug a single test:
* enable console output: add the `@verbose` tag
* enable debugging statements and verbose output: add the `@debug` tag

To determine test coverage, run `bin/coverage`.
The coverage in relatively low because TextRunner contains copious amounts of
defensive checks against invalid user input.
Not all permutations of that are tested.


## Linting

* run all linters: `bin/lint`
* run JavaScript linters: `bin/lint-js`
* run Markdown linters: `bin/lint-md`

The JavaScript Standard linter does not properly handle Flow types at this point,
hence it is recommended to only show flow lint messages in your editor,
not the error messages from "standard".
Use the `bin/lint-js` script instead.


## Terminology

TextRunner is a framework that allows to execute _actions_ defined by _blocks_
in Markdown documents.
Each MarkDown file consists of plain text (that is not executable),
and a number of _blocks_ (which are executable).
Blocks are specially marked up regions of MarkDown.
The markup for a block contains a decription of the _type_ of the block.
comes with built-in block types,
for example to create files or directories, verify file contents,
or start external processes.
You can also create your own _custom block types_
by providing the corresponding action in the form of a
JavaScript method that TextRunner calls when it wants to execute a block of this type.


## Architecture

The architecture is best understood by following along
with how a set of documents is tested.
There are several CLI executables to start TextRunner:
- [bin/text-run](bin/text-run) for unix-like systems and macOS
- [bin/text-run.cmd](bin/text-run.cmd) for Windows

These CLI executables call the [cli.js](src/cli.js) CLI handler.
They parse the command-line arguments and call TextRunner's JavaScript API
in the form of the [TextRunner](src/text-runner.js) class.
This API is also exported by the [TextRunner NPM module](https://www.npmjs.com/package/text-runner)
and can be used by other tools.

The TextRunner class is the central part of TextRunner.
It instantiates and runs the other components of the framework.
Next TextRunner determines the various configuration settings
coming from command-line arguments and/or configuration files
via the [configuration](src/configuration.js).
This class is passed to the various subsystems of TextRunner
in case they need to know configuration settings.
Based on the configuration, TextRunner determines the command to run.
Commands are stored in the [commands](src/commands) folder.
The most important command is [run](src/commands/run),
there are others like [help](src/commands/help),
[setup](src/commands/setup), or [version](src/commands/version).

The `run` command determins the Markdown files to test (via the configuration object),
and creates a [MarkdownFileRunner](src/commands/run/markdown-file-runner.js) instance for each file.
Running the files happens in two phases.
In the first `prepare` phase, each MarkdownFileRunner parses the Markdown content,
determines the active blocks and link targets in it,
and creates a list of action instances (methods that execute the active blocks in the file).
It uses several helper classes like
[MarkdownParser](src/commands/run/markdown-parser.js) and
[ActivityListBuilder](src/commands/run/activity-list-builder.js),
and [LinkTargetBuilder](src/commands/run/link-target-builder.js) for that.
TextRunner comes with built-in actions for common operations
in the [actions](src/actions) folder.
The code base using TextRunner can also add their own action types.

In the second `run` phase the prepared actions are executed one by one.
They now have full access to all link targets in all other files.
The actions signal their progress, success, and failures via
[formatters](src/formatters).
TextRunner provides two formatters: a simple [dot formatter](src/formatters/dot-formatter.js)
and a [detailed formatter](src/formatters/detailed-formatter.js),
which prints more details as it runs.
When using TextRunner via its JavaScript API,
you have to provide your own formatter to gain access to the stream of test run events.
If an action signals test failure
by throwing an exception or returning an error via callback or Promise,
TextRunner stops the execution, displays the error via the formatter,
and stops with an exit code of 1.
Otherwise it stops with an exit code of 0 when it reaches the end of its list of actions to perform.
