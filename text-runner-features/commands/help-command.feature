Feature: help command

  Scenario:
    When running "text-run help"
    Then it prints:
      """
      USAGE: .*

      COMMANDS
      """
