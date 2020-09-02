@smoke
Feature: checking embedded Markdown images

  Scenario: existing local Markdown image with relative path
    Given the source code contains a file "1.md" with content:
      """
      ![Alt text](watermelon.gif "watermelon")
      """
    And the workspace contains an image "watermelon.gif"
    When running Text-Runner
    Then it signals:
      | FILENAME | 1.md                 |
      | LINE     | 1                    |
      | MESSAGE  | image watermelon.gif |

  Scenario: existing local Markdown image with absolute path
    Given the source code contains a file "documentation/1.md" with content:
      """
      ![Alt text](/documentation/images/watermelon.gif "watermelon")
      """
    And the workspace contains an image "documentation/images/watermelon.gif"
    When running Text-Runner
    Then it signals:
      | FILENAME | documentation/1.md                         |
      | LINE     | 1                                          |
      | MESSAGE  | image /documentation/images/watermelon.gif |

  Scenario: non-existing local Markdown image
    Given the source code contains a file "1.md" with content:
      """
      ![Alt text](zonk.gif "watermelon")
      """
    When trying to run Text-Runner
    Then the test fails with:
      | FILENAME      | 1.md                          |
      | LINE          | 1                             |
      | ERROR MESSAGE | image zonk.gif does not exist |
      | EXIT CODE     | 1                             |

  @online
  Scenario: existing remote Markdown image
    Given the source code contains a file "1.md" with content:
      """
      ![Alt text](http://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png "google logo")
      """
    When running Text-Runner
    Then it signals:
      | FILENAME | 1.md                                                                                    |
      | LINE     | 1                                                                                       |
      | MESSAGE  | image http://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png |

  @online
  Scenario: non-existing remote Markdown image
    Given the source code contains a file "1.md" with content:
      """
      ![Alt text](http://google.com/onetuhoenzonk.png "zonk")
      """
    When running Text-Runner
    Then it signals:
      | FILENAME | 1.md                                                     |
      | LINE     | 1                                                        |
      | MESSAGE  | image http://google.com/onetuhoenzonk.png                |
      | OUTPUT   | image http://google.com/onetuhoenzonk.png does not exist |

  Scenario: Markdown image tag without source
    Given the source code contains a file "1.md" with content:
      """
      ![Alt text]()
      """
    When trying to run Text-Runner
    Then the test fails with:
      | FILENAME      | 1.md                     |
      | LINE          | 1                        |
      | ERROR MESSAGE | image tag without source |
      | EXIT CODE     | 1                        |
