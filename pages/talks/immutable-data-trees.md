# Immutable data trees in JavaScript

London, 2014-02-12

(The talk was recorded: [video](http://vimeo.com/86694423))

***

- Szymon Witamborski
- [@szywon](https://twitter.com/szywon)
- http://szywon.pl

# Where I come from?

- uni times, Clojure times
- GUI FTW

# Clojure

- functional
- immutable data structures
- Lisp

# Clojure (stealing from)

- functional
- **immutable data structures**
- Lisp

# Why immutability?

- enforce separation between things
- (functions, modules, third-party code)

# Why immutability?

avoid side effects of one *thing* changing state of another

# Why immutability?

- security
- (to ensure no one's messing with our data)

# Why immutability?

- avoid copying data over and over
- (that we maybe do to enforce security)

# Different ways of sharing state

- When passing data from one place to another…
- (function, module, third-party code)

# …with a convention

# Send data as-is

*with a convention N<sup>o</sup>1*

data belongs to the sender,<br>
receiver shouldn't modify

# Send data as-is

*with a convention N<sup>o</sup>2*

data belongs to the receiver,<br>
sender shouldn't modify

# Send data as-is

*with a convention N<sup>o</sup>3*

both sender and receiver can modify<br><span class="parenthesis">:(</span>

# Conventions, meh

A newcomer will break it

# Conventions, meh

- You will break it
- (because you forgot or had a bad day)

# Conventions, meh

- Laura and Mike agree
- but Zenon doesn't care

(third-party code)

# Computer!

program computers, not people

# …with Object.freeze

# Object.freeze (ES5)

has to be done recursively for full immutability

# Object.freeze

- any modification: full copy.
- ES5 browsers only (no IE8)

# …with a function

# Protecting data in JavaScript

secure and portable way:

- make it private to a function (closure)
- function controls access to it's data

# MVCC

# Multi-Version Concurrency Control (MVCC)

- immutable
- versioned
- old (DBs, Clojure, Haskell, Scala)

# MVCC

- each version is immutable
- each *mutation* creates a new version

# MVCC in DBs

- writes don't block reads
- readers never see inconsistent state
- allow rollback

# Clojure's persistent data structures

MVCC

# Clojure's persistent data structures

- structure sharing between versions
- only the part affected by the update is copied

# Clojure's structure sharing

- collection is internally a tree instead of being flat
- nice performance characteristics

# Clojure's structure sharing

- saves RAM
- saves operations when creating new versions

# Clojure's persistent data structures

- nearly constant lookups and updates
- (log<sub>32</sub>N)

# How it works?

(and making peace with immutability)

***

    v0 = ["a", "s", "d", "f"]

# Let's make a binary tree

***

    { 00: "a"
      01: "s"
      10: "d"
      11: "f" }

(keys in binary code)

***

    0 | 0 "a"
    0 | 1 "s"
    1 | 0 "d"
    1 | 1 "f"

(divide keys to 1 bit sized chunks)

# Store data in a binary tree

(each chunk of the key is an address for one level of the tree)

    { 0: { 0: "a",
           1: "s" },

      1: { 0: "d",
           1: "f" } }

# Lookup performance

2 (4 elements, log<sub>2</sub>4 = **2**)

***

    { 0: { 0: { 0: "a",
                1: "s" },

           1: { 0: "d",
                1: "f" } },

      1: { 0: { 0: "g",
                1: "h" }

           1: { 0: "j",
                1: "k" } } }

# Lookup performance

3 (8 elements, log<sub>2</sub>8 = **3**)

***

    { 00: { 00: "a",    10: { 00: "q",
            01: "s",          01: "w",
            10: "d",          10: "e",
            11: "f" },        11: "r" },

      01: { 00: "g",    11: { 00: "t",
            01: "h",          01: "y",
            10: "j",          10: "u",
            11: "k" },        11: "i" } }

# Lookup performance

2 (16 elements, log<sub>4</sub>16 = **2**)

# Lookup performance

- we chose **2 bit** chunk size
- each key is **4 bits** long
- (size = 16 = 2<sup>4</sup>, log<sub>2</sub>16 = 4)
- key is split to **2 chunks**
- tree has to be **2-level** deep

**2** lookups

# Lookup performance

What happens if we

- increase chunk size to 5
- increase array size to 32768 (2<sup>15</sup>)

?

# Lookup performance (5 bit)

- (00000 00000 00000)
- **15 bits** keys (log<sub>2</sub>32768 = 15)
- **5 bit** chunk size (log<sub>2</sub>32768 / 5 = **3**)
- key is split to **3 chunks**
- tree has to be **3-level** deep

**3** lookups

***

<p class="math">depth = &lceil;key_bits / chunk_bits&rceil;
node_size = 2<sup>chunk_bits</sup>
chunk_bits = log<sub>2</sub>node_size

depth = &lceil;log<sub>2</sub>size / log<sub>2</sub>node_size&rceil;
log<sub>A</sub>B / log<sub>A</sub>C</sub> = log<sub>C</sub>B
depth = &lceil;log<sub>node_size</sub>size&rceil;</p>

***

<p class="math">depth = &lceil;log<sub>node_size</sub>size&rceil;
chunk_size = 5
node_size = 2<sup>5</sup> = 32
size = 32768

depth = &lceil;log<sub>32</sub>32768&rceil; = 3</p>

# Lookup performance

    function lookups (bits, size) {
      return Math.ceil(
        Math.log(size)
        /
        Math.log(Math.pow(2, bits))
      )
    }

    lookups(5, 32768) // 3
    lookups(5, 1024)  // 2
    lookups(1, 16)    // 4

# Lookup performance (5 bit)

log<sub>32</sub>N

# Mutation

    v1 = v0.set(10, "z")

# Mutation

- copy only nodes on the path to the updated leaf
- set new value at the new copy of leaf

***

    v1 = v0.set(10, "z")

<pre><code>v0 = { 0:     <span class="captured">{ 0: "a", </span>
            <span class="diagonal_line capturing">-</span> <span class="captured">  1: "s" }</span>,
           <span class="vertical_line capturing">-</span>
       1:  <span class="vertical_line capturing">-</span>  { 0: "d",
           <span class="vertical_line capturing">-</span>    1: <span class="captured">"f"</span> } }
<span class="capturing">          <span class="diagonal_line">-</span>         <span class="vertical_line">-</span>
v1 = { 0:           <span class="vertical_line">-</span>
       1: { 0: "z" <span class="diagonal_line">-</span>
            1: <span class="horizontal_line">-</span><span class="horizontal_line">-</span><span class="to_diagonal_line">-</span></span></code></pre>

# Mutation performance (5 bit)

- tree is **log<sub>32</sub>N** levels deep
- affected path is **log<sub>32</sub>N** nodes long
- **log<sub>32</sub>N** new nodes created
- each node has **32** elements
- \+ **32 * log<sub>32</sub>N** assignments


33 \* log<sub>32</sub>N ~ **log<sub>32</sub>N**

# A case for MVC frameworks

MVC frameworks need to know when to update the view

*Have my data changed?*

# A case for MVC frameworks

mutable data:

- either one recursive check or many pin-pointed checks (similar complexity)
- recursive == slow
- recursive == RAM hungry (two full copies)
- :(

# A case for MVC frameworks

immutable:

- only root reference has to be checked
- MVC holds the reference to the old root
- very memory efficient with structure sharing
- :)

# A case for MVC frameworks

Using immutable data might actually speed up you MVC application.

**MVC <span class="heart">❤</span> MVCC**

# Choice is yours

<ul class="or_list">
<li>immutable data **everywhere**
<li>on **function** boundary
<li>on **module** boundary
<li>on **you | third-party** boundary
<li>mutable data
</ul>

# In a functional program…

data made immutable as soon as received (HTTP request, file read)

# In a functional program…

profiler: find bottlenecks<br>
critical parts made mutable if needed

# In a functional program…

mutable data considered a type of premature optimisation

# Immutable data in JavaScript

# Quick reminder

already immutable:

- numbers
- strings
- bools
- …

# Existing libraries (mori, …)

- give it a tree, only root level is immortalised
- non-recursive

# mori

- much more than just data (whole collection API of ClojureScript)

# Ancient Oak

an experiment with interface and implementation

# Ancient Oak

Clojure-style MVCC library for plain JavaScript data **trees**

(with emphasis on trees)

# Ancient Oak

- gets whole trees of data in
- processes recursively
- no need to wrap anything separately

# Ancient Oak

returns a function (the getter) with various update/iterate methods

# Ancient Oak

    => I({ a: 1, b: [ 2, 3 ] })

    <= { [Function get]
         set:   [Function set],
         patch: [Function patch],
         map:   [Function map],
         … }

# Ancient Oak

Easy in, easy out

    data = I({ a: 1, b: [ 2, 3 ] })

    => data.dump()
    <= { a: 1, b: [ 2, 3 ] }

# Ancient Oak

Every node of the tree is a tree on its own.

    tree = I({ a: 1, b: [ 2, 3 ] })

    => tree("b")
    <= { [Function get]
         … }

# Ancient Oak's types

1:1 mapping between native JavaScript types and immutable ones

(Array, Object)

# Array (Ancient Oak)

- sorted unsigned integer keys,
- size reported in `size` property instead of `length` (because it's a function)

# Object (Ancient Oak)

unsorted map, string keys

# Ancient Oak assumptions

- functions and primitive types treated as immutable
- functions are assumed to be interfaces to data (getters)

# Ancient Oak

- good for storing plain data
- and nothing else (atm)

# API: get

    data = I({ a: 1, b: [ 2, 3 ]})
    data         // function…
    data("a")    // 1
    data("b")    // function…
    data("b")(1) // 3

# API: dump & json

    data = I({ a: 1, b: [ 2, 3 ]})

    => data.dump()
    <= { a: 1, b: [ 2, 3 ] }

    => data.json()
    <= '{"a":1,"b":[2,3]}'

# API: set

    v0 = I({ a: 1, b: [ 2, 3 ] })
    v1 = v0.set("c", 5).set("a", 4)

    => v0.dump()
    <= { a: 1, b: [ 2, 3 ] }

    => v1.dump()
    <= { a: 4, b: [ 2, 3 ], c: 5 }

# API: rm

remove an address from the tree

    v0 = I({ a: 1, b: { c: 3, d: 4 } })
    v1 = v0.rm("b", "d")

    => v1.dump()
    <= { a: 1, b: { c: 3 } }

# API: update

apply a function on a value

    v0 = I({ a: 1, b: 2 })
    v1 = v0.update("a", function (v) {
      return v + 1
    })

    => v1.dump()
    <= { a: 2, b: 2 }

# API: patch

apply a diff on the whole tree

    v0 = I({ a: 1, b: [ 2, 3 ] })
    v1 = v0.patch({
      a: 2,
      b: { 0: 4, 3: 5 }
    })

    => v1.dump()
    <= { a: 2,
         b: [ 4, 3, , 5 ] }

# API: iteration

- currently forEach, map and reduce
- mostly same as native semantics
- only reduce is a bit incompatible (easy fix)

# API: map

returns the same type of collection as the original (object/array)

    v0 = I({ a: 1, b: 2 })
    v1 = v0.map(function (v) {
      return v + 1
    })

    => v1.dump()
    <= { a: 2, b: 3 }

# API: data as a function

    data = I({a: 1, b: 2, c: 3})

    => [ "a", "b", "c"].map(data)
    <= [ 1, 2, 3 ]

# Contributions welcome

- still early stage
- target is to handle JSONifiable data
- tweaking for speed
- suggestions to API?
- any ideas about storing dates?<br>(and stuff with getters and setters)

# Resources

- [Understanding Clojure's Persistent Vectors](http://hypirion.com/musings/understanding-persistent-vector-pt-1) by Jean Niklas L'orange
- [Ancient Oak on GitHub](https://github.com/szywon/)
- [Ancient Oak's docs with lib included](http://szywon.pl/ancient-oak) (to&nbsp;try&nbsp;in&nbsp;devtools)
- [@szywon](https://github.com/szywon), [szywon.pl/talks](http://szywon.pl/talks)
