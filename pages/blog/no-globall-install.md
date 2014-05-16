# Ways of NOT installing node tools globally

London, 2014-05-16.

I find it annoying when a project asks me to install some of its
dependencies globally. Simply because it's not necessary at all.

The thing is: grunts, bowers and browserifies come and go. Also they
get updates, possibly not compatible with the old version. Anything
installed globally is fire under your dependency hell. Some
projects you're working on *will* break.

Your project should be as self-contained as possible. Joining a
project should be as simple as `git clone` and *one* `npm
install`. Any other steps are unnecessary distractions. If you ask
your contributors (or users, that would be even worse) to `npm install
-g` you're making it their problem, not yours (and their dependency
hell).

NPM gives us enough power to avoid using `-g` entirely.

There's one annoying thing about project-local installs (but it's
probably *the* only one): to reach any command line tool we have to
type `node_modules/.bin/`. There are two ways to avoid doing that:

## 1. NPM as a task runner

One of the coolest things about npm is that everything that's run with
`npm run` has already proper `$PATH` set (including
`node_modules/.bin`). To leverage that, we need to put some commands
in the `scripts` part of the package.json file. That makes for a great
place to be for commands that are part of our usual workflow.

    {
      …
      "scripts": {
        "start": "broccoli serve",
        "test": "jasmine-node test"
      },
      "devDependencies": {
        "broccoli-cli": "^0.0.1",
        "broccoli": "^0.12.0",
        "jasmine-node": "^1.14.3"
      }
      …
    }

We can run those scripts with `npm run start` and `npm run test` or
with `npm start` and `npm test` short-hand forms. We can put any
arbitrary entries in `scripts` and then run it with:

    npm run <name>

As an useful extra, some fields from `package.json` are exported in a
form of environmental variables, so we can use them like this:

    scripts: {
      "build-js": "browserify app.js > $npm_package_name-$npm_package_version.js"
    }

I highly recommend a read through [npm-script documentation]
[npm-scripts]. Lots of useful stuff.

## 2. Alias for all the other use cases

Typing `node_modules/.bin` again and again sounds boring, so we put
this in our shell config:

    alias n='PATH=./node_modules/.bin:$PATH'

We've just made it much shorter: `n <command>`. This is good for
one-off use (like testing a command, discovering parameters etc.). If
you find yourself using some command repetitively, you might want to
consider putting it in `scripts`.

(We could just put `node_modules/.bin` in our global `$PATH` but
there's a number of possible security issues with that like somebody
putting malicious stuff in `node_modules/.bin` in a folder we download
and then `cd` into it.)

I think it's much better to encourage others to do this little alias
thing rather than telling them that they need to install each of *n*
dependencies globally.

## Completely legitimate exceptions

BUT there are completely legitimate cases for user-wide or system-wide
installations: general-purpose command line tools. Good examples are
[jipe] [jipe] (JSON output formatter) and [node-inspector] [inspector]
(debugger).

[npm-scripts]: https://www.npmjs.org/doc/misc/npm-scripts.html
[jipe]: https://www.npmjs.org/package/jipe
[inspector]: https://www.npmjs.org/package/node-inspector
