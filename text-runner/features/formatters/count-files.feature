Feature: Counting files

  Scenario: a test suite with multiple files
    Given the source code contains a file "1.md" with content:
      """
      <a textrun="test">
      </a>
      """
    And the source code contains a file "2.md" with content:
      """
      <a textrun="test">
      </a>
      """
    When running text-run
    Then it prints:
      """
      2 activities in 2 files
      """

  Scenario: a test suite where some files don't contain active blocks
    Given the source code contains a file "1.md" with content:
      """
      No active block here
      """
    And the source code contains a file "2.md" with content:
      """
      <a textrun="test">
      </a>
      """
    When running text-run
    Then it prints:
      """
      1 activities in 2 files
      """
