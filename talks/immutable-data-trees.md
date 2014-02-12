# Immutable data trees in JavaScript

London, 2014-02-12

***

Szymon Witamborski

[@szywon](https://twitter.com/szywon)

http://szywon.pl

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

enforce separation between things

(functions, modules, third-party code)

# Why immutability?

avoid side effects of one *thing* changing state of another

# Why immutability?

security

(to ensure no one's messing with our data)

# Why immutability?

avoid copying data over and over

(that we maybe do to enforce security)

# Different ways of sharing state

When passing data from one place to another…

(function, module or third-party code)

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

data is shared, both sender and receiver can modify <span class="parenthesis">:(</span>

# Conventions, meh

A newcomer will break it

# Conventions, meh

You will break it

(because you forgot or had a bad day)

# Conventions, meh

- Laura and Mike agree
- but Zenon doesn't care

(third-party code)

# Computer!

let's program computers, not people

# Object.freeze (ES5)

has to be done recursively for full immutability

# Object.freeze

- any modification: full copy.
- ES5 browsers only (no IE8)

# Protecting data in JavaScript

secure and portable way:
make&nbsp;it&nbsp;private to a function

# Multi-Version Concurrency Control (MVCC)

- immutable
- versioned
- old (DBs, Clojure, Haskell, Scala)

# MVCC

- each version is immutable
- each *mutation* creates a new version

# Original purpose of MVCC

- writes don't block reads
- readers never see inconsistent state

(in DBs)

# Clojure's persistent data structures

MVCC

# Clojure's persistent data structures

- structure sharing between versions
- only the part affected by the update is copied

# Clojure's structure sharing

- saves RAM
- saves operations when creating new versions

# Clojure's persistent data structures

- nearly linear lookups and updates
- (log<sub>32</sub>N)

# Making peace with immutability

***

    v0 = ["a", "s", "d", "f"]

***


    { 00: "a"
      01: "s"
      10: "d"
      11: "f" }

(keys in binary code)

***

    0 | 0
    0 | 1
    1 | 0
    1 | 1

(divide keys to 1 bit sized chunks)

# Store data in a tree

(each chunk of the key is an address for one level of the tree)


    { 0: { 0: "a",
           1: "s" },

      1: { 0: "d",
           1: "f" } }

# Lookup performance

2

# Lookup performance (1 bit)

- we chose **1 bit** chunk size
- each key is **2 bits** long (size = 4 = 2<sup>2</sup>)
- key is split to **2 chunks**
- tree has to be **2-level** deep

**2** lookups (each constant-time)

# Lookup performance (1 bit)

<p class="math">chunk_size = 1 (bit)
size = 4 (elements)

node_size = 2<sup>chunk_size</sup> = 2<sup>1</sup> = 2
lookups = log<sub>node_size</sub>size = 2</p>

# Lookup performance (1 bit)

log<sub>2</sub>N

- log<sub>2</sub>16 = 4
- log<sub>2</sub>1024 = 10

# Lookup performance

What happens if we

- increase chunk size to 5
- increase array size to 32768 (2<sup>15</sup>)

?

# Lookup performance (5 bit)

- we chose **5 bit** chunk size
- each key is **15 bits** long
- key is split to **3 chunks**
- tree has to be **3-level** deep

(00000 00000 00000)

**3** lookups

# Lookup performance (5 bits)

<p class="math">chunk_size = 5 (bits)
size = 4096 (elements)

node_size = 2<sup>chunk_size</sup> = 2<sup>5</sup> = 32
lookups =
log<sub>node_size</sub>size = log<sub>32</sub>32768 = 3</p>

# Lookup performance (5 bit)

log<sub>32</sub>N

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

# Mutation

    v1 = v0.set(10, "z")

# Mutation

- copy only nodes on the path to the updated leaf
- set new value at the leaf

***

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

- **log<sub>32</sub>N** nodes have to be copied
- each node has **32** elements
- **32 * log<sub>32</sub>N** copies

log<sub>32</sub>N

# A case for MVCs

MVCs need to know when to update view.

*Have my data changed?*

# A case for MVCs

mutable data:

- checking has to be recursive, slow
- two full copies have to be in memory (please correct me on that)

:(

# A case for MVCs

immutable:

- only root has to be checked
- MVC holds the reference to the root
- very memory efficient with structure sharing

:)

# Choice is yours

<ul class="or_list">
<li>immutable data everywhere
<li>on function boundary
<li>on module boundary
<li>mutable data
</ul>

# In a functional program…

data made immutable as soon as received (HTTP request, file read)

# In a functional program…

- profiler: find bottlenecks
- critical parts made mutable if needed

# In a functional program…

mutable data considered a type of premature optimization

# Immutable data in JavaScript

# Quick reminder

Some JavaScript types are already immutable, namely all simple types:

- numbers
- strings
- bools
- …

# Existing libraries (mori)

- one-level deep, non-recursive
- not smart about type of data passed in (object/array/value)
- inconvenient when passing trees of data (every collection needs to be wrapped separately)
- much more than just data (whole collection API of ClojureScript)

# Ancient Oak

an experiment with interface and implementation

# Ancient Oak

Clojure-style MVCC library for plain JavaScript data trees

(with emphasis on trees)

# Ancient Oak

- gets whole trees of data in
- processes recursively
- no need to wrap anything separately

# Ancient Oak

Easy in, easy out

    => I({ a: 1, b: [ 2, 3 ] }).dump()

    <= { a: 1, b: [ 2, 3 ] }

# Ancient Oak

Gets data in, returns a function (the&nbsp;getter) with various update/iterate methods

# Ancient Oak

    => I({ a: 1, b: [ 2, 3 ] })

    <= { [Function get]
         set:   [Function set],
         patch: [Function patch],
         map:   [Function map],
         … }

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
- size reported in `size` property instead of `length`

# Object (Ancient Oak)

unsorted map, string keys

# Ancient Oak assumptions

- functions and simple types treated as immutable
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

# API: dump

    data = I({ a: 1, b: [ 2, 3 ]})

    data.dump() // { a: 1, b: [ 2, 3 ] }
    data.json() // '{"a":1,"b":[2,3]}'

# API: set

    v0 = I({ a: 1, b: [ 2, 3 ] })
    v2 = v0.set("c", 5).set("a", 4)

    => v0.dump()
    <= { a: 1, b: [ 2, 3 ] }

    => v2.dump()
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

    <= v1.dump()
    => { a: 2,
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

    v1.dump() // { a: 2, b: 3 }

# API: data as a function

    data = I({a: 1, b: 2, c: 3})

    => [ "a", "b", "c"].map(data)
    <= [ 1, 2, 3 ]

# Contributions welcome

- still early stage
- target is to handle JSONifiable data properly
- suggestions to API?
- any ideas about dates? (possibly other stuff with getters and setters)
- performance testing and tweaking for speed

# Resources

- [Understanding Clojure's Persistent Vectors by Jean Niklas L'orange](http://hypirion.com/musings/understanding-persistent-vector-pt-1)
- [Ancient Oak on GitHub](https://github.com/szywon/)
- [Ancient Oak's docs with lib included](http://szywon.pl/ancient-oak) (to&nbsp;try&nbsp;in&nbsp;devtools)
- [@szywon](https://github.com/szywon), [szywon.pl/talks](http://szywon.pl/talks)
