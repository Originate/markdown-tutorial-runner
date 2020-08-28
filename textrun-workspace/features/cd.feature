Feature: changing the working directory

  Scenario: pointing to an existing directory via hyperlink
    Given the source code contains a file "directory_changer.md" with content:
      """
      Create file <a type="workspace/new-file">**foo/bar** with content `hello`</a>.

      Change into the <code type="workspace/working-dir">foo</code> directory.
      You see a file <a type="workspace/existing-file">
        __bar__ `hello`
      </a>
      """
    When running text-run
    Then it signals:
      | FILENAME | directory_changer.md            |
      | LINE     | 3                               |
      | MESSAGE  | changing into the foo directory |


  Scenario: pointing to an existing directory via code block
    Given the source code contains a file "directory_changer.md" with content:
      """
      Create file <a type="workspace/new-file">**foo/bar** with content `hello`</a>.

      <code type="workspace/working-dir">foo</code>
      <a type="workspace/existing-file">
        __bar__

        ```
        hello
        ```
      </a>
      """
    When running text-run
    Then it signals:
      | FILENAME | directory_changer.md            |
      | LINE     | 3                               |
      | MESSAGE  | changing into the foo directory |


  Scenario: pointing to a non-existing directory
    Given the source code contains a file "directory_changer.md" with content:
      """
      <code type="workspace/working-dir">foo</code>
      """
    When trying to run text-run
    Then the test fails with:
      | FILENAME      | directory_changer.md    |
      | LINE          | 1                       |
      | ERROR MESSAGE | directory foo not found |
      | EXIT CODE     | 1                       |
