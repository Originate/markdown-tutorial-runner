Feature: Fail on non-actionable Markdown

  As a tutorial writer
  I want to get warnings if my whole tutorial doesn't perform a single action
  So that I know I am doing something wrong and can fix my mistake.

  - a tutorial with no actions whatsoever causes the test to fail


  Scenario: tutorial with no actions
    Given my workspace contains the file "1.md" with the content:
      """
      Just text here, nothing to do!
      """
    When running tut-run
    Then it signals:
      | WARNING | no activities found |
