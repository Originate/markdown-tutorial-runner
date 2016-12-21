Feature: verifying the NPM package name

  As the developer of an NPM module
  I want to be able to verify that installation instructions for my module are correct
  So that my readers can start using my tool right away.

  - surround the installation instructions via the "verifyNpmPackageName" action


  Background:
    Given my workspace contains the file "package.json" with the content:
      """
      {
        "name": "my_enormous_package"
      }
      """


  Scenario: correct package name with triple-fenced code block
    Given my workspace contains the file "1.md" with the content:
      """
      To install, run:

      <a class="tutorialRunner_verifyNpmInstall">
      ```
      $ npm i -g my_enormous_package
      ```
      </a>
      """
    When running tut-run
    Then it signals:
      | FILENAME | 1.md                         |
      | LINE     | 3-7                          |
      | MESSAGE  | installs my_enormous_package |


  Scenario: correct package name with single-fenced code block
    Given my workspace contains the file "1.md" with the content:
      """
      installation: <a class="tutorialRunner_verifyNpmInstall">`npm i -g my_enormous_package`</a>
      """
    When running tut-run
    Then it signals:
      | FILENAME | 1.md                         |
      | LINE     | 1                            |
      | MESSAGE  | installs my_enormous_package |


  Scenario: mismatching package name
    Given my workspace contains the file "1.md" with the content:
      """
      To install, run:

      <a class="tutorialRunner_verifyNpmInstall">
      ```
      npm i -g zonk
      ```
      </a>
      """
    When trying to run tut-run
    Then the test fails with:
      | FILENAME      | 1.md                                       |
      | LINE          | 3-7                                        |
      | ERROR MESSAGE | verifying NPM installs my_enormous_package |
      | EXIT CODE     | 1                                          |


  Scenario: missing installation instructions
    Given my workspace contains the file "1.md" with the content:
      """
      To install, run:

      <a class="tutorialRunner_verifyNpmInstall">
      </a>
      """
    When trying to run tut-run
    Then the test fails with:
      | FILENAME      | 1.md                                    |
      | LINE          | 3                                       |
      | MESSAGE       | verifying NPM installation instructions |
      | ERROR MESSAGE | missing code block                      |
      | EXIT CODE     | 1                                       |


  Scenario: missing package name
    Given my workspace contains the file "1.md" with the content:
      """
      To install, run:

      <a class="tutorialRunner_verifyNpmInstall">
      ```
      npm i
      ```
      </a>
      """
    When trying to run tut-run
    Then the test fails with:
      | FILENAME      | 1.md                                       |
      | LINE          | 3-7                                        |
      | ERROR MESSAGE | verifying NPM installs my_enormous_package |
      | EXIT CODE     | 1                                          |
