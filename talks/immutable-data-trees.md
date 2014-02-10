# Immutable data trees in JavaScript

London, 2014-02-12

***

Szymon Witamborski

[@szywon](https://twitter.com/szywon)

http://szywon.pl

# Where I come from?

- Clojure
- before it was cool (circa 2009)

# Clojure

- functional
- immutable data structures
- Lisp
- JVM, ClojureScript

# Why immutability?

enforce separation between things

<pre class="parenthesis"><code>
(things = [functions,
           modules,
           third-party code])</code></pre>

# Why immutability?

avoid side effects of one *thing* changing state of another

# Why immutability?

avoid copying data over and over

# Different ways of sharing state

When passing data from one place to another

(function, module or third-party code)

# Send data as-is

*with a convention N<sup>o</sup>1*

data belongs to sender, receiver shouldn't modify

# Send data as-is

*with a convention N<sup>o</sup>2*

data belongs to receiver, sender shouldn't modify

# Send data as-is

*with a convention N<sup>o</sup>3*

data is shared, both sender and receiver can modify

# Convetions, meh

A newcomer will break it

# Convetions, meh

You will break it

(because you forgot or had a bad day)

# Conventions, meh

Computer!

(if a computer can enforce something, we have one convention less, a win!)

# Object.freeze

has to be recursive for true immutability

# Object.freeze

any modification: full copy.

# Multi-Version Concurency Control (MVCC)

- immutable
- versioned
- old (databases, Clojure, Haskell, Scala)

# Multi-Version Concurency Control

- each version is immutable
- each *mutation* creates a new version

# MVCC -- original purpose (DBs)

- writes don't block reads
- readers never see inconsistent state

# Clojure's persistent data structures

- MVCC

# Clojure's persistent data structures

- structure sharing between version, only the part affected by update is copied to the new version.

# Clojure's persistent data structures

- nearly linear lookups and updates (log_n 32)

# Clojure's persistent data structures

graph1, state original

# Clojure's persistent data structures

graph2, state updated

# A case for MVCs

MVCs need to know when to update view, basically question is "Did my data changed?".

# A case for MVCs

mutable data:

- checking has to be recursive, slow
- two full copies have to be in memory (please correct me on that)

:(

# A case for MVCs

immutable:

- only root has to be checked
- very memory efficient with structure sharing

:)

# Choice is yours

- immutable data everywhere
- on function boundary
- on module boundary
- mutable data

# In a functional program…

data made immutable as soon as received (HTTP request, file read)

# In a functional program…

- profiler used to find bottlenecks
- critical parts made mutable if needed

# In a functional program…

mutable data considered a type of premature optimization

# Quick reminder

Some JavaScript types are immutable, namely all simple types:

- numbers
- strings
- bools

# Existing libraries (mori)

- one-level deep, non-recursive
- not smart about type of data passed in (objecet/array/value)
- unconvienent when passing trees of data (every collection needs to be wrapped separately)

# Ancient Oak

recursive Clojure-style MVCC library for plain JavaScript data

# Ancient Oak

- gets whole trees of data in
- no need to wrap everything separately

# Ancient Oak

Easy in, easy out

    => I({ a: 1, b: [ 2, 3 ]}).dump()
    <= { a: 1, b: [ 2, 3 ] }

# Ancient Oak

1:1 mapping between native JavaScript types and immutable ones

(Array, Object)

# Ancient Oak types

Array:

- sorted integer keys,
- size reported in `size` property instead of `length`

# Ancient Oak types

Object: unsorted hash

# Ancient Oak assumptions

- functions and simple types treated as immutable
- functions are assumed to be collections (getters)

# Ancient Oak

- good for storing plain data
- not good module for interfaces

# Ancient Oak

- Gets data in, returns a function (getter) with various update/iterate methods
- Every node of the tree is a tree on its own.

# API: get

    var data = I({ a: 1, b: [ 2, 3 ]});
    data         // function…
    data("a")    // 1
    data("b")    // function…
    data("b")(1) // 3

# API: dump

    var data = I({ a: 1, b: [ 2, 3 ]});
    data.dump() // { a: 1, b: [ 2, 3 ] }
    data.json() // '{"a":1,"b":[2,3]}'

# API: set

    var v0 = I({ a: 1, b: [ 2, 3 ] });
    var v1 = v0.set("c", 5).set("a", 4);
    v1.dump() // { a: 4, b: [ 2, 3 ], c: 5 }
    v0.dump() // { a: 1, b: [ 2, 3 ] }

# API: rm

    var v0 = I({ a: 1, b: { c: 3, d: 4 } });
    var v1 = v0.rm("b", "d");
    v1.dump(); // { a: 1, b: { c: 3 } }

# API: update

    var v0 = I({ a: 1, b: 2 });
    var v1 = v0.update("a", function (value) {
      return value + 1
    });
    v1.dump() // { a: 2, b: 2 }

# API: patch

    var v0 = I({ a: 1, b: [ 2, 3 ] });
    var v1 = v0.patch({ a: 2, b: { 0: 4, 3: 5 } });
    v1.dump(); // { a: 2, b: [ 4, 3, , 5 ] }

# API: iteration

- currently forEach, map and reduce
- mostly compatibible with native JavaScript counterparts
- only reduce is a bit incompatible (easy fix)

# API: map

returns the same type of collection as the original (object/array)

    var v0 = I({a: 1, b: 2});
    var v1 = v0.map(function (v) { return v + 1 });
    v1.dump() // { a: 2, b: 3 }

# API: use data as a function

    [ "a", "b", "c"].map(I({a: 1, b: 2, c: 3}))
    // [ 1, 2, 3]

# Contributions welcome

- still early stage
- suggestions to API?
- performance testing and tweaking for speed
- how to handle dates

# Why not just use ClojureScript

- my personal preference
- JavaScript is good enough language
- functions with closures and plain data is powerful enough
