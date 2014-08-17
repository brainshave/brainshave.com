# Tracing pixels

London, 2014-08-20.

There are many reasons to use SVG: for sprites, fonts, vector
graphics, etc. Currently developers are not giving it enough credit
(we're catching up). The reason we'll be focusing here is somewhat
different. After some research [source!] and experimentation it turns
out it might be also the best way to serve pixel art. Why?  Because
all other options require either `<canvas>`+JavaScript hacks or don't
work in all browsers (CSS solutions).

This post describes a simple algorithm that [SharpVG] [sharpvg] uses
to trace pixel shapes. Accidentally, at the same time we're explaining
a bit of the SVG's path syntax and cutting holes in shapes with the
`nonzero` fill rule.

## Intuition

Lets start with a simple shape. A pixelated letter "n". Then, we'll
trace it using our, well, intuition. [Figure 1](#fig1) is showing the
very simple pixelated representation of the letter. If we start from left top corner `0,0` and start moving clockwise, the trace will look like on the [figure 2](#fig2).

<figure id="fig1" class="center">
  <object data="tracing-pixels-images/n-big.svg" type="image/svg+xml">
    <img src="tracing-pixels-images/n-big.png">
  </object>

  <figcaption>
    fig. 1: Our hero: pixelated letter "n".
  </figcaption>
</figure>

<figure id="fig2" class="center">
  <object data="tracing-pixels-images/steps.svg"
          type="image/svg+xml">
    <img src="tracing-pixels-images/steps.png">
  </object>

  <figcaption>
    fig. 2: Steps of going around the letter "n".
  </figcaption>
</figure>

Lets now list the steps and encode them with the moves they represent
([fig. 3](#fig3)). Horizontal moves will be represented with letter
`h` and vertical with `v`. Each move is one step in either direction
so it will have value either 1 or -1. Given that `0,0` is in the top
left corner, `h1` means right, `h-1` is left, `v1` means down and
`v-1` is up. (Think [LOGO] [logo] but without rotation.)

<figure id="fig3" class="center">
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0001wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0011wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0010wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move1001wl_right" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0010wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move1010wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move1000wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0100wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0101wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move1001wl_left" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move1110wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move1010wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move1000wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0100wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0101wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="tracing-pixels-images/moves.svg#move0101wl" />
  </svg>

  <figcaption>
    fig. 3: "n" steps with SVG directions.
  </figcaption>
</figure>

We can notice that <svg width="27" height="27"><use xlink:href="tracing-pixels-images/moves.svg#move1001"></use></svg>
is first `h1` and then `h-1`. The direction in which we'll go depends
from where we're coming. It basically says "turn left".
If we come from above, we go right (`h1`).
If we come from under we go left (`h-1`).
Same goes for <svg width="27" height="27"><use xlink:href="tracing-pixels-images/moves.svg#move0110"></use></svg>
where we're also turning left, but we go `v1` or `v-1`.
These are the only instances where we need to base next move on the
previous one because we can get ourselves in to these situations from two
directions. Other situations are free from this ambiguity.

I've used this notation because it's exactly the path syntax in SVG,
using relative movements. We mark the starting point with absolute
"move to" command, in this case to point `0,0` so in SVG it'll be `M 0
0`. Because the last move is ending at the starting point, we might as
well replace it with `z` to close the path.

The full path looks like on [figure 4](#fig4).

<figure id="fig4">
  <code>M 0 0 h1 h1 v1 h1 v1 v1 h-1 v-1 v-1 h-1 v1 v1 h-1 v-1 v-1 z</code>

  <figcaption>
    fig. 4: The full uncompressed path for the letter "n".
  </figcaption>
</figure>

Path syntax is a little mini-language that's meant to live inside the
`d` (data) attribute of `<path>` elements. So full source of the image
looks like on [figure 5](#fig5) and the image itself is the [figure
6](#fig6).

<figure id="fig5">
  <pre><code>&lt;svg width="3" height="3"
     xmlns="ht<span>tp://</span>www.w3.org/2000/svg"&gt;
  &lt;path d="M0 0h2v1h1v2h-1v-2h-1v2h-1z" fill="#777777"/&gt;
&lt;/svg&gt;</code></pre>

  <figcaption>
    fig. 5: Full SVG source.
  </figcaption>
</figure>

<figure id="fig6" class="center">
  <img src="tracing-pixels-images/n.svg" width="186" height="186">

  <figcaption>
    fig. 6: The resulting SVG image (scaled up &times;54).
  </figcaption>
</figure>

You might notice that the path in the SVG image is a bit
different. [SharpVG] [sharpvg] is compressing the output by combining
neighbouring moves if they're the same, for example `h1 h1` will
become `h2` in the output.

## Extrapolation

Our "n" example doesn't exhaust all possible moves but by rotating
four base situations we can easily get all possible cases as in the
[figure 7](#fig7). (We can notice that most of the moves in the "n"
trace are in fact just other moves rotated.)

<figure id="fig7" class="center">
  <object data="tracing-pixels-images/moves.svg" type="image/svg+xml">
    <img src="tracing-pixels-images/moves.png">
  </object>

  <figcaption>
    fig. 7: All possible moves
  </figcaption>
</figure>

## Algorithm's outline

In the "n" example we just started in the point `0,0` but that's
usually not the case that our shape starts there. There also might
more than one shape to trace in the image. To detect all of them,
[SharpVG] [sharpvg] is scanning the whole image, finding all the
shapes and tracing them. The algorithm from top-level looks like this:
(the "corner" here means any situation from the [fig. 7](#fig7))

1. Scan the image, start with point `0,0`, going through every
row. Once a corner is found, start tracing.

2. Trace the shape, marking every point we go through as *visited*.

3. Continue scanning until we find another corner that was not yet
*visited* or until we reach end of the image.

   1. If an unvisited corner is found, trace the new shape. (goto 2)
   2. If we reach end of the image, finish.

Marking as *visited* is necessary so that we never trace the same
shape twice (from a different starting point, for example).

## Holes

Paths found by the tracing algorithm will also include holes, like the
ones in "o" of "B" letters. And now some SVG "magic": If we put
multiple paths (each starting with `M` and ending with `z`) in one SVG
`<path>` element, SVG renderer will do the "smart thing" and cut the
holes accordingly, with the default [`nonzero` fill rule] [fill].

How it works? Intuitively: if a path inside another path is drawn in
opposite direction, it'll be cut out of the outer shape. So if the
outer shape is drawn clockwise and the inner one is drawn
counter-clockwise it'll be cut out. For more precise definition, check
the [SVG docs on fill properties] [fill].

Notice that, the inside of the letter "n" runs counter-clockwise while
the outside of "n" runs clockwise ([fig 2.](#fig2)). If we close the
"n", we'll get an "o" as on [figure 8](#fig8) and now it's even more
apparent in which way things go.

<figure id="fig8" class="center">
  <object data="tracing-pixels-images/hole.svg" type="image/svg+xml">
    <img src="tracing-pixels-images/hole.png">
  </object>

  <figcaption>
    fig. 8: Inner shape cutting a hole in the outer shape
  </figcaption>
</figure>

Actually, I've discovered this by accident. I wasn't thinking yet
about how to cut the holes but while trying to compress the output a
bit by combining paths into one `<path>` element it "magically" all
came into place. Then I've started researching why it's doing this
much rightful thing :-)

## Colour

First version of [SharpVG] [sharpvg] treated all colours as black. It
was actually trivial to expand it to handle colours: we treat each
colour as a separate 1-bit image. Resulting SVG image will have one
path per colour.

## Summing up

SVG is currently quite underused by web developers. During writing
this article I was very pleased with what you can do with it. The ease
of reusing elements from different images is one shiny example: in any
SVG image, we can take anything from another one provided we gave it
an `id` attribute. I makes for a very good solution for creating
resource libraries (sprites). I highly recommend this good read about
the [`<use>` element on Sara Soueidan's blog] [use].

For me, converting pixelated graphics to SVGs and then manipulating
them is perfect because it's quick and fun to create a small pixelated
image and disguises my lack of proper drawing talent.

[sharpvg]: https://github.com/brainshave/sharpvg
[logo]: http://en.wikipedia.org/wiki/Logo_(programming_language)
[fill]: http://www.w3.org/TR/SVG/painting.html#FillProperties
[use]: http://sarasoueidan.com/blog/structuring-grouping-referencing-in-svg/
