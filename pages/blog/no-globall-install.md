# Ways of NOT installing npm modules globally

London, 2014-05-12.

I find it annoying when a project asks me to install some of its
dependencies globally. Simply because it's not necessary at all, in
most cases.

The thing is: grunts, bowers and browserifies come and go. Also they
get updates, possibly not compatible with old version. Some projects
you're working on will break. Why should you install one single
version globally? I don't know. Maybe for quick tests or something,
but it doesn't sound like a good idea as being the go-to recommended
way.

Your project should be as self-contained as possible and
reasonable. Reason is simple: convenience for you and others. Starting
to work on a project should be as simple as `git clone` and *one* `npm
install`.

There's one annoying thing about project-local installs (but it's
probably *the* only one): you have to type `node_modules/.bin/` when
you want to reach any command line tool. There are two ways to avoid
doing that:

## 1. NPM as a task runner

One of the coolest things about npm is that everything that's in the
`scripts` field of your `package.json` and executed with `npm run` has
already proper `$PATH` set. (Yes, including `node_modules/.bin`.)
That makes it quite convenient to put there anything that's part of
your usual workflow.

    {
      …
      "scripts": {
        "start": "broccoli serve",
        "test": "jasmine-node spec"
      },
      "dependencies": {
        "broccoli-cli": "^0.0.1",
        "broccoli": "^0.12.0",
        "jasmine-node": "^1.14.3"
      }
      …
    }

You can run those scripts with `npm run start` and `npm run test` but
they have `npm start` and `npm test` short-hand forms. You can put any
arbitrary entries in `scripts` and then run it with:

    npm run <script-name>

As an useful extra, all fields from `package.json` are exported in a
form of environmental variables, so you can use them like this:

    scripts: {
      "build-js": "browserify app.js > $npm_package_name-$npm_package_version.js"
    }

Using `npm run` will make it easier for everybody to work on your
project. For newcomers it means they only care about `npm start`
(or something else, like `test`), unloading some weight off (probably already
quite convoluted) learning curve. For current people on the project it
means they don't need to mind at all if you (the person responsible
for build tools) decide to switch from Grunt to something else. One
sure thing about Node right now is that npm is not going anywhere (and
if it does you have a bigger problem anyway).

I highly recommend a read through [npm-script documentation]
[npm-scripts]. Lots of useful stuff.

## 2. Alias for all the other use cases

Need to use that specific tool for a one-off thing? (If it's
repetitive, you should consider putting it in `scripts`.) Typing
`node_modules/.bin` again and again sounds boring, so we do this:

    alias n='PATH=./node_modules/.bin:$PATH'

We've just made it much shorter: `n <your_command>`. You could just
put `node_modules/.bin` in your global `$PATH` but there's a number of
possible security issues with that (like somebody putting malicious
stuff in `node_modules/.bin` in a folder you download and then `cd`
into it).

I think it's much better to encourage others to do this little alias
thing rather than telling them that they need to install each of *n*
dependencies globally.

## Completely legitimate exceptions

BUT there are completely legitimate cases for user-wide or system-wide
installations. Those tools that you would use outside of any project,
general-purpose command line tools are quite the no-brainer category
here. Good examples for me are [jipe] [jipe] and [node-inspector]
[inspector].

[npm-scripts]: https://www.npmjs.org/doc/misc/npm-scripts.html
[jipe]: https://www.npmjs.org/doc/misc/npm-scripts.html
[inspector]: https://www.npmjs.org/package/node-inspector