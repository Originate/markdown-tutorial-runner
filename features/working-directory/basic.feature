@skipWindows
Feature: separate working directory

  As a documentation writer
  I want the tests for my documentation to run in a directory separate from my tutorial
  So that I don't clutter up my documentation source code with temporary files creating by the tests.

  - by default the tests run in the current directory
  - to run the tests in an external temporary directory,
    provide the "use-temp-directory: true" option in text-run.yml


  Background:
    Given my workspace contains the file "1.md" with content:
      """
      <a class="tr_runConsoleCommand">
      ```
      pwd
      ```
      </a>
      """


  Scenario: default configuration
    When running text-run
    Then it runs in the "tmp" directory


  Scenario: running in a local temp directory
    Given my text-run configuration contains:
      """
      useTempDirectory: false
      """
    When running text-run
    Then it runs in the "tmp" directory


  Scenario: running in a global temp directory
    Given my text-run configuration contains:
      """
      useTempDirectory: true
      """
    When running text-run
    Then it runs in a global temp directory


  Scenario: running in a custom directory
    Given my text-run configuration contains:
      """
      useTempDirectory: '.'
      """
    When running text-run
    Then it runs in the current working directory
