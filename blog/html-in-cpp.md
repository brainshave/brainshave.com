# Embedded Declarative HTML in C++

Lublin, 2011-11-20

Here's for some crazy C++:

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

that's giving us this:

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


Inspired by [Hiccup](https://github.com/weavejester/hiccup) and a slide in a
[presentation](http://www.infoq.com/presentations/The-Kotlin-Programming-Language)
on Kotlin language, I wanted to try something like this with the newest bits of
[C++11](http://en.wikipedia.org/wiki/C%2B%2B11).

## `std::initializer_list`

C++11 introduced the
[`std::initializer_list`](http://en.wikipedia.org/wiki/C%2B%2B11#Initializer_lists)
type which is a neat enhancement to C's intializer lists. C's
initializer lists are a way for creating arrays and structs:

    int array[] = { 1, 2, 3 };
    struct { float a, b; } number = { 0, -1 };


C++'s `std::initializer_list` is a clever enhancement because it's a
runtime object which knows how many elements are in it and those
elements are created automatically by the compiler. It's useful in
functions and constructors when you want to pass some inline data
structures, for example a function:

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
it. The source code is in
[this gist](https://gist.github.com/1380325/).
Probably the longest and least interesting
part is the `render` method, but somewhat obligatory to see if the
whole thing works at all.

<p class="sidenote">Without macros!</p>

In C++11, solution is straight-forward and maybe even handsome but I am
most curious how it could be done in older versions of C++. I think
that `initializer_list`s and other new features of C++11 (lambdas!)
made it possible to create more sophisticated internal DSLs than the
one presented here. Maybe even something like
[GUI FTW](http://github.com/santamon/GUIFTW).

([source code](https://gist.github.com/1380325/))
