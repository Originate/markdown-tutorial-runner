node_modules\o-tools-livescript\bin\build
set EXOSERVICE_TEST_DEPTH=API
node_modules\.bin\cucumber-js --tags ~@clionly --tags ~@todo --tags ~@skipWindows --format progress
