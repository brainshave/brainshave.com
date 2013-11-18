# Embedded Declarative HTML in C++

Lublin, 2011-11-20

How about writing that in C++:

    Node html
    {"html", {{ "lang", "pl" }}, { // tag with attributes
      {"head", { // tag without attributes
        {"title", {
          "Page Title" // text node
        }}
      }},
      {"body", {{ "style", "background-color: #fff;" }}, {
        {"h1", {"Page Title"}},
        {"div", {}} // empty tag
      }}
    }};

    cout << html;

and getting that:

    <html lang="pl">
      <head>
        <title>
          Page Title
        </title>
      </head>
      <body style="background-color: #fff;">
        <h1>
          Page Title
        </h1>
        <div />
      </body>
    </html>


Clojure has the [Hiccup](https://github.com/weavejester/hiccup) and
Groovy has it's
[builders](http://groovy.codehaus.org/Creating+XML+using+Groovy%27s+MarkupBuilder)
for XML/HTML generation. I saw today a
[presentation](http://www.infoq.com/presentations/The-Kotlin-Programming-Language)
with an example of this in
[Kotlin](http://confluence.jetbrains.net/display/Kotlin/Welcome), with
static typing...

I wanted to see if something like this is possible in C++. It turned
out that with help of some newest and freshest stuff in
[C++11](http://en.wikipedia.org/wiki/C%2B%2B11) it was pretty
straight-forward.

## `std::initializer_list`

C++11 introduced the
[`std::initializer_list`](http://en.wikipedia.org/wiki/C%2B%2B11#Initializer_lists)
type which is a neat enhancement to C's intializer lists. C's
initializer lists are a way for creating arrays and structs:

    int array[] = { 1, 2, 3 };
    struct { float a, b; } number = { 0, -1 };


C++'s `std::initializer_list` is a clever enhancement because it's an
runtime object which knows how many elements are in it and are created
automatically by the compiler. It's useful in functions and
constructors when you want to pass some inlined data structures, for
example a function:

    int sum(initializer_list<int> numbers) {
      int s = 0;
      // a proper foreach is also a C++11 feature
      for (const int i : numbers) {
        s += i;
      }
      return s;
    }


could be used like:

    sum({1, 2, 3, 4});

New implementations of STL containers (such as `vector`s) support that
in constructors so you can fill them with data in construction time:

    vector<int> nums {1, 2, 3};


## Proof'O'Concept

In my humble proof of concept I just extended the use of
`std::initializer_list`. Each node in tree is either:

- a text node (constructor with one string arg)
- a tag with attributes (each attribute is a pair of name and value) and children (nested nodes, so it's recursive)
- a tag without attributes but with children (if a tag is childless you have to pass an empty children list, otherwise it will be treated as a text node)

For each variant there's a different constructor. That's pretty much
it. I've pasted a complete [gist](https://gist.github.com/1380325/) at
the end of this article. Probably the longest and least interesting
part is the `render()` method, but somewhat obligatory to see if the
whole thing works at all.

<p class="sidenote">Without macros!</p>

In C++11, solution is straight-forward and maybe even handsome but I am
most curious how it could be done in older versions of C++. I think
that `initializer_list`s and other new features of C++11 (lambdas!)
made it possible to create more sophisticated internal DSLs than the
one presented here. I actually believe it *is* now possible to implement
something like [GUI FTW](http://github.com/santamon/GUIFTW) in C++.

The source code is in
[this gist](https://gist.github.com/1380325/).
