# Immutable data trees in JavaScript

    + Ancient Oak

***

    Szymon Witamborski
    @szywon
    http://szywon.pl

# Where I come from?

- Clojure
- before it was cool (circa 2009)

# Clojure

- functional
- immutable data structures
- Lisp
- JVM, ClojureScript

# Why would we want immutability?

- enforcing separation between modules
  - one module shouldn't depend on the other for changing their state, otherwise, they'll become too dependent on each other
  - making sure that one module doesn't mess with other module's state
  - same for third-party code, like widgets
- safely sharing state

# full immutability / perceived immutability / conventional immutability

# Different ways of sharing the state

We're sending data from one place to another (be it a function, module
or third-party widget). We can either:

# Send data as-is (a convention kicks in)

- data belongs to sender, receiver shouldn't modify
- data belongs to receiver, sender shouldn't modify
- data is shared, both sender and receiver can modify

# Problems with conventions:

- newcomers to the project will break it
- why remember a convention if we have computers to enforce them? or
- if we have a strong feeling how something should be done, we should use the computer to enforce them.

# Object.freeze

- has to be recursive, otherwise
- forces both sender and receiver to create full copies before any modifications are done

# Multi-version Concurency Control

- immutable
- versioned
- old (databases, Clojure, Haskell, Scala)

# Multi-version Concurency Control

- each version is immutable
- each "modification" is actually creating a new version

# MVCC -- original purpose in DBs

- If reads and writes are happening at the same time, readers don't see new version untils it's completed (transactions, etc.)
- readers never see inconsistent state

# Clojure persistent data structures

- MVCC
- structure sharing between version, only the part affected by update is copied to the new version.
- nearly linear lookups and updates (log_n 32)

# Clojure persistent data structures

graph1, state original

# Clojure persistent dat structures

graph2, state updated

# A case for MVCs

MVCs need to know when to update view, basically question is "Did my data changed?".

- mutable data: checking has to be recursive, slow and memory inefficient, two full copies have to be in memory (please correct me on that)
- immutable: only root has to be checked; if we use structure sharing, very memory efficient.

# Choice is yours

- immutable data everywhere
- immutable data on function boundary
- immutable data on module boundary

# My suggestion

- make data immutable as soon as you get it (HTTP request, file read)
- profile and find bottlenecks, make critical parts mutable if needed
- consider mutable data as a type of premature optimization

# Quick reminder

Some JavaScript types are immutable, namely all simple types:

- numbers
- strings
- bools

# Existing libraries (mori)

- one-level deep, non-recursive
- not smart about type of data passed in (objecet/array/value)
- unconvienent when passing trees of data, every collection needs to be wrapped separately.

# Ancient Oak

recursive Clojure-style MVCC library for plain JavaScript data

# Ancient Oak

- gets whole trees of data at once
- no need to wrap everything separately

# Ancient Oak

Easy in, easy out

    I({ a: 1, b: [ 2, 3 ]}).dump()
    // { a: 1, b: [ 2, 3 ] }

# Ancient Oak

1:1 mapping between native JavaScript types and immutable ones

(Array, Object)

# Ancient Oak types

- Array: sorted `int` keys, size reported in `size` property
- Object: unsorted hash

# Ancient Oak assumptions

- functions and simple types treated as immutable
- functions are assumed to be collections (getters)

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
    var v1 = v0.update("a", function (value) { return value + 1 });
    v1.dump() // { a: 2, b: 2 }

# API: patch

    var v0 = I({ a: 1, b: [ 2, 3 ] });
    var v1 = v0.patch({ a: 2, b: { 0: 4, 3: 5 } });
    v1.dump(); // { a: 1, b: [ 2, 3, , 5 ] }

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
- making