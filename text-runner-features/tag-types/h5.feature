Feature: active h5 tags

  Background:
    Given the source code contains the HelloWorld action

  Scenario: H5 tag
    Given the source code contains a file "1.md" with content:
      """
      <h5 type="HelloWorld">hello</h5>
      """
    When running Text-Runner
    Then it signals:
      | FILENAME | 1.md        |
      | LINE     | 1           |
      | MESSAGE  | Hello world |
