# Designing with functions

London, 2014-06-27.

> Coming from OOP, I've found functional *programming* quite easy to learn, but finding functional *library API design* surprisingly difficult

> <footer>@jo_liss, [in a twitter status] [jo_liss]</footer>

If you come from an inherently OO/class-based language or a language that strongly encourages OO design, you might find quite a dissonance if you approach a language that is neither of those. Take for example JavaScript where OO constructs like prototype-based inheritance look awkward, especially if you try to replicate structure of equivalent Java or Ruby code. Seems like more natural approach to JavaScript would be using plain functions and data instead.

This article is based mostly on my recent work on [Ancient Oak] [oak] and [Zetzer] [zetzer]. Feel free to explore their source code.

I don't want to dissolve the meaning of the term "functional programming" any more than it is already. FP should always refer to stateless, zero side effects programming for the sake of future unambiguous communication. I think that the approach presented here would be better described as "function-oriented", "closure-oriented" or "process-oriented" programming.

An "API" in this article means any interface we can have in a program: be it a function, a module or a library.

## Concepts

I've noticed that I tend to write basically only two types of APIs:

1. stateless objects, a reusable processes, things with one input and one output. If it additionally has no side effects it's getting closer to a proper FP.
2. The stateful object, that is: holds some state and provides methods to query and alter it.

Some techniques on how to implement these concepts will follow after a short intermission.

## INTERMISSION (on state)

But the main difference we can make is actually not in the techniques that we use but in our defaults. Most OO JavaScript applications tend to implement everything (data, module interfaces, classes) as mutable state. This is unfortunate because it forbids from making some safety assumptions that we get from using immutable data, like that class (prototype) or module interface won't change during application's life cycle or that something else won't modify the data in the meantime.

It requires a different discipline to avoid these problems. Basically we should have only few places in our applications that represent mutable state and they'd best hold immutable data structures. We should make those places central to the application and well-defined so at any time it's easy to tell what can change, instead of getting surprised while debugging with "my goodness, this changed here".

My own enlightenment came when I realised how little mutability an app requires.

As an example I'll use the good old PHP/CGI model. Applications in this model have ultra-short life cycle, they're instantiated when a request comes in, they handle that request and then die. From the outside, they're just processes, they get input and render the output. The only way to save any important state from its inevitable destiny is to dump it to a database.

This is what I meant by saying "central". In this model you basically have *one* place where the state can change.

The "old" PHP model is an extreme example but definitely illustrates how far you can go with having as little mutable state in an application as possible. This model worked for years and we actually still use it in some form, even if we're writing Ruby or Node code now. Point is, anything beyond the database in this model can easily be immutable and there's no good reason why it shouldn't.

An example for this model on the client-side already exists. It's called Om and it has one global state. Side effect of this approach is that the UI presented is basically a function of this state (same way a PHP page is a function of the state in a database). This is an interesting (and definitely radical!) approach.

## Processes

Probably the easiest way to understand how to model processes is the good old UNIX shell.

Shell programming, all quirks aside, has a very clear separation between configuration, input and output. And well, "processes" in shell are literally OS processes.

It works like this: The configuration is set by the command line. Input is the `stdin` and output is the `stdout` stream. You don't put input in the command line parameters and you don't mix configuration into data.

    > grep -o root < /etc/passwd > /tmp/root_words

In this useless example the `-o root` part is the configuration for the new `grep` process. `/etc/passwd` is the input and `/tmp/root_words` is the output.

This model is very simple to transplant to JavaScript (or to any language with closures). The entry point to your API (module, library, etc.) is a *setup* function that receives the configuration object and returns a function that has the config in a closure. This returned function is the process proper and it receives the input and returns the output.

    function setup (config) {
      // do some setup here…
      return function process (input) {
        // process input
        return output
      }
    }

Composing processes is also directly transplantable:

    > syslog | grep -i invalid | tail -10

The same thing in JavaScript would be written as: (`syslog` has no config in this case):

    var tail = tail_setup({ lines: 10 })
    var grep = grep_setup({
      query: "invalid",
      ignore_case: true
    })

    tail(grep(syslog()))

It'll look even better if tail, grep and syslog would return promises:

   syslog().then(grep).then(tail)

It's possible two processes could have the same configuration. You can then return an object with multiple functions (processes). It's not rare and I won't discourage doing it. It's up to you. It definitely makes sense when two processes are clearly related.

## Statefuls

First of, using class-like approach (with inheritance, `this` keyword and stuff) might be just good enough for many. I have my own reasons not to use prototyped-based inheritance and `this` to build APIs: (I would still use it internally in some cases, but not in the exposed API)

1. The state of the object is not private (everyone can inspect and modify internal state of the object, possibly breaking its integrity; ironically this is great for debugging).
2. I prefer when methods preserve their context so you don't have to call it as a method or reapply `this` every time you invoke it.

Instead of assigning the state of the object on `this`, the state can be just local variables in the constructor. Constructor instead of returning the state object returns an object with methods to interact with it. These methods are functions defined inside the constructor so that they have access to constructor's local scope.

    function counter (init) {
      var state = init || 0

      return {
        inc: function inc () { return ++state },
        get: function get () { return state }
      }
    }

## Putting it all together

To reiterate, you should have only few of statefuls in your application and make them central, treat them as databases. Then processes, when they're done, dump their results to the database. Simple.

[oak]: https://github.com/szywon/ancient-oak
[zetzer]: https://github.com/cambridge-healthcare/grunt-stencil
[jo_liss]: https://twitter.com/jo_liss/status/451246943549665280