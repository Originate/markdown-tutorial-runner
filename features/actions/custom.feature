Feature: custom runners

  As a tutorial writer
  I want to be able to define my own block actions
  So that my tutorial can perform things that go beyond the built-in actions.

  - put built-in actions into a file "tut-run/<action name>.js"
  - the structure of these files should match the structure of the built-in actions


  Scenario: using a valid built-in async action
    When executing the "custom-action-async" example
    Then it signals:
      | FILENAME | custom-action.md   |
      | LINE     | 3                  |
      | MESSAGE  | greeting the world |


  Scenario: using a valid built-in sync action
    When executing the "custom-action-sync" example
    Then it signals:
      | FILENAME | custom-action.md   |
      | LINE     | 3                  |
      | MESSAGE  | greeting the world |
