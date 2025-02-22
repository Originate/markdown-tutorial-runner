<picture>
  <source media="(prefers-color-scheme: dark)" srcset="documentation/logo_800_dark.png">
  <source media="(prefers-color-scheme: light)" srcset="documentation/logo_800_light.png">
  <img alt="Text-Runner logo" src="documentation/logo_800_light.png">
</picture>

<div align="center">

[![CI](https://github.com/kevgo/text-runner/actions/workflows/ci.yml/badge.svg)](https://github.com/kevgo/text-runner/actions/workflows/ci.yml)
[![CI](https://ci.appveyor.com/api/projects/status/96q06796xyrste9x/branch/main?svg=true)](https://ci.appveyor.com/project/kevgo/text-runner/branch/main)
<br>

</div>

Text-Runner is a test framework for user-facing documentation. It helps keep
documentation up to date. An example is the text you are reading right now.
TextRunner verifies it for technical correctness.

If you tell it how, TextRunner can read and understand any form of
Markdown-formatted text in any human language as well as complex data in tables,
bullet point lists, and even embedded images!

### For users

- [how it works](documentation/how-it-works.md)
- [installation](documentation/installation.md)
- [built-in actions](documentation/built-in-actions.md)
- [user-defined actions](documentation/user-defined-actions.md)
  - [example actions](examples/)
- [Q&A](documentation/qna.md)
- [related tools](documentation/related-tools.md)

### Plugins

- [verify source code files](textrun-repo/)
- [modify/verify workspace files](textrun-workspace/)
- [run executables in a subshell](textrun-shell/)
- [run/verify embedded JavaScript code](textrun-javascript/)
- [verify Makefile targets](textrun-make/)
- [verify the documentation of npm modules](textrun-npm/)
- [verify the documentation of Text-Runner plugins](textrun-action/)

### For developers

This mono-repository contains the source code for the Text-Runner engine,
tooling, and some plugins containing popular actions.

- [developers guide](documentation/DEVELOPMENT.md)
- [text-runner-core](text-runner-core): the Text-Runner engine
- [text-runner-cli](text-runner-cli): runs Text-Runner on the command line
- [text-runner-features](text-runner-features): end-to-end tests for core and
  CLI
- [shared test code](shared/)
