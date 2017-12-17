@clionly
Feature: selecting formatter via the command-line

  As a documentation writer
  I want to be able to configure TextRunner to use different formatters via command-line parameters
  So that I can try different formatters out easily.

  - you can chose a formatter using the `--format <[formatter name]>` command-line parameter
    or the `formatter` key in `text-run.yml`


  Background:
    Given my source code contains the file "1.md" with content:
      """
      <a class="tr_runConsoleCommand">
      ```
      echo "Hello world"
      ```
      </a>
      """


  @clionly
  Scenario Outline: selecting formatters via command-line parameter
    When running "text-run --format <FORMATTER>"
    Then it runs without errors

    Examples:
      | FORMATTER |
      | robust    |
      | colored   |
      | iconic    |


  @clionly
  Scenario: selecting an unknown formatter
    When trying to run "text-run --format zonk"
    Then the call fails with the error:
      """
      Unknown formatter: 'zonk'

      Available formatters are colored, iconic, robust
      """
