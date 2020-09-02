Feature: active anchor tags

  Background:
    Given the source code contains the HelloWorld action

  Scenario: anchor tag
    Given the source code contains a file "1.md" with content:
      """
      <a type="HelloWorld">hello</a>
      """
    When running Text-Runner
    Then it signals:
      | FILENAME | 1.md        |
      | LINE     | 1           |
      | MESSAGE  | Hello world |

  Scenario: anchor block
    Given the source code contains a file "1.md" with content:
      """
      <a type="HelloWorld">
      hello
      </a>
      """
    When running Text-Runner
    Then it signals:
      | FILENAME | 1.md        |
      | LINE     | 1           |
      | MESSAGE  | Hello world |
