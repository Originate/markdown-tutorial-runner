# running JavaScript code

To run JavaScript code:

<a class="tutorialRunner_runMarkdownInTutrun">
```html
<a class="tutorialRunner_runJavascript">
`​``
console.log('This is getting executed by Tutorial Runner!')
`​``
</a>
```
</a>


## Asynchronous code

Tutorial Runner waits for the code block to finish before continuing with the tutorial.
To make it wait for asynchronous code,
add the placeholder `<CALLBACK>` where your code would call the callback when its done.
Example:

<a class="tutorialRunner_runMarkdownInTutrun">
```html
<a class="tutorialRunner_runJavascript">
`​``
const fs = require('fs')
fs.writeFile('hello.txt', 'hello world', <CALLBACK>)
`​``
</a>
```
</a>


Alternatively you can also use the placeholder `// ...`
<a class="tutorialRunner_runMarkdownInTutrun">
```html
<a class="tutorialRunner_runJavascript">
`​``
const fs = require('fs')
fs.writeFile('hello.txt', 'hello world', function(err) {
  // ...
})
`​``
</a>
```
</a>



## Substitutions

Each block of Javascript code runs in its own environment.
To make local variables sharable between different blocks of Javascript,
this step performs the the following replacements:
- `/\bthis\./`  -->  `global.`
- `/\bconst /`  -->  `global.`
- `/\bvar /`  -->   `global.`

So `const foo = 123` gets turned into `global.foo = 123`,
thereby making `foo` accessible in all code blocks.

You can create your own replacements by adding a `replacements` block
for this action
in `tut-run.yml`:

```yml
actions:

  runJavascript:
    replace:
      "regex to find": "text to replace it with"
```


#### More info

- [feature specs](../../features/actions/built-in/run-javascript/run-javascript.feature)
- [source code](../../src/actions/built-in/run-javascript.ls)
