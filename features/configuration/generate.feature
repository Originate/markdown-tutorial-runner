Feature: generating a configuration file

  As a Tutorial Runner user setting up the tool on a new project
  I want to be able to generate a configuration file with the default options set
  So that I can run the tool successfully after customizing the options to my project's situation.

  - call "tut-run setup" to generate a configuration file


  @clionly
  Scenario: running in a directory without configuration file
    Given I am in a directory that contains the "simple" example without a configuration file
    When running the "setup" command
    Then it prints:
      """
      Create configuration file tut-run.yml with default values
      """
    And it creates the file "tut-run.yml" with the content:
      """
      files: '**/*.md'
      globals: []
      """
