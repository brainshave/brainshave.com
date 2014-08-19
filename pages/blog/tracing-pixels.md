# Tracing pixels

London, 2014-08-20.

There are many reasons to use SVG: for sprites, fonts, vector
graphics, etc. Currently developers are not giving it enough credit
(we're catching up). The reason we'll be focusing here is somewhat
different. After reading some [research] [state] and experimentation
it turns out it might be also the best way to serve pixel art. Why?
Because all other options require either `<canvas>`+JavaScript hacks
or don't work in all browsers (CSS solutions).

This post describes a simple algorithm that [SharpVG] [sharpvg] uses
to trace pixel shapes. At the same time, accidentally, we're explaining
a bit of the SVG's path syntax and cutting holes in shapes with the
`nonzero` fill rule.

<div style="display: none;" data-load-modules="szywon.fix_svg_pos"></div>

<!-- SVG assets library for this article -->
<svg width="0" height="0" version="1.1"
     style="display: none;"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <symbol id="move1000" viewBox="0 0 27 27" >
      <path fill="#ff0219" d="M17,4h1v14h-7v2h-1v-1h-1v-1h-1v-1h1v-1h1v-1h1v2h6z"/>
      <path fill="#000000" d="M5,5h11v1h-2v7h2v1h-2v2h-1v-2h-7v7h7v-2h1v2h7v-7h-2v-1h2v-7h-2v-1h3v17h-17v-17M6,6v7h7v-7z"/>
      <path fill="#777777" d="M6,6h7v7h-7z"/>
    </symbol>

    <symbol id="move0100" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move1000" transform="rotate(90, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move0010" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move1000" transform="rotate(-90, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move0001" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move1000" transform="rotate(180, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move0111" viewBox="0 0 27 27" >
      <path fill="#ff0219" d="M9,0h1v1h1v1h1v1h-2v7h-6v-1h5v-6h-2v-1h1v-1h1z"/>
      <path fill="#000000" d="M5,5h3v1h-2v2h-1v-3M11,5h11v17h-17v-11h1v2h7v-7h-2v-1M14,6v7h7v-7h-7M6,14v7h7v-7h-7M14,14v7h7v-7z"/>
      <path fill="#777777" d="M14,6h7v7h-7v-7M6,14h7v7h-7v-7M14,14h7v7h-7z"/>
    </symbol>

    <symbol id="move1011" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move0111" transform="rotate(90, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move1101" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move0111" transform="rotate(-90, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move1110" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move0111" transform="rotate(180, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move0011" viewBox="0 0 27 27" >
      <path fill="#000000" d="M5,5h17v17h-17v-11h1v2h7v-2h1v2h7v-7h-7v2h-1v-2h-7v2h-1v-3M6,14v7h7v-7h-7M14,14v7h7v-7z"/>
      <path fill="#ff0219" d="M16,7h1v1h1v1h1v1h-1v1h-1v1h-1v-2h-12v-1h12z"/>
      <path fill="#777777" d="M6,14h7v7h-7v-7M14,14h7v7h-7z"/>
    </symbol>

    <symbol id="move1100" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move0011" transform="rotate(180, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move1010" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move0011" transform="rotate(90, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move0101" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move0011" transform="rotate(-90, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move1001" viewBox="0 0 27 27" >
      <path fill="#ff0219" d="M17,4h1v5h6v-2h1v1h1v1h1v1h-1v1h-1v1h-1v-2h-7v-6M2,15h1v2h7v6h-1v-5h-6v2h-1v-1h-1v-1h-1v-1h1v-1h1z"/>
      <path fill="#000000" d="M5,5h11v1h-2v7h7v-2h1v11h-11v-1h2v-7h-7v2h-1v-11M19,5h3v3h-1v-2h-2v-1M6,6v7h7v-7h-7M14,14v7h7v-7h-7M5,19h1v2h2v1h-3z"/>
      <path fill="#777777" d="M6,6h7v7h-7v-7M14,14h7v7h-7z"/>
    </symbol>

    <symbol id="move0110" viewBox="0 0 27 27">
      <use width="27" height="27" xlink:href="#move1001" transform="rotate(90, 13.5, 13.5)"/>
    </symbol>

    <symbol id="move0001wl" viewBox="0 0 27 40">
      <use xlink:href="#move0001" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">h1</text>
    </symbol>

    <symbol id="move0011wl" viewBox="0 0 27 40">
      <use xlink:href="#move0011" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">h1</text>
    </symbol>

    <symbol id="move0010wl" viewBox="0 0 27 40">
      <use xlink:href="#move0010" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">v1</text>
    </symbol>

    <symbol id="move1001wl_right" viewBox="0 0 27 40">
      <use xlink:href="#move1001" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">h1</text>
    </symbol>

    <symbol id="move1001wl_left" viewBox="0 0 27 40">
      <use xlink:href="#move1001" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">h-1</text>
    </symbol>

    <symbol id="move1010wl" viewBox="0 0 27 40">
      <use xlink:href="#move1010" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">v1</text>
    </symbol>

    <symbol id="move1000wl" viewBox="0 0 27 40">
      <use xlink:href="#move1000" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">h-1</text>
    </symbol>

    <symbol id="move0100wl" viewBox="0 0 27 40">
      <use xlink:href="#move0100" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">v-1</text>
    </symbol>

    <symbol id="move0101wl" viewBox="0 0 27 40">
      <use xlink:href="#move0101" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">v-1</text>
    </symbol>

    <symbol id="move1110wl" viewBox="0 0 27 40">
      <use xlink:href="#move1110" width="27" height="27" y="0" x="0"/>
      <text x="7" y="40" class="meta">v1</text>
    </symbol>

    <symbol id="pixel" viewBox="0 0 27 27">
      <rect x="1" y="1" width="25" height="25" fill="#888888" />
    </symbol>
  </defs>
</svg>
<!-- end of the SVG asset library -->

## Intuition

Lets start with a simple shape. A pixelated letter "n". Then, we'll
trace it using our, well, intuition. [Figure 1](#fig1) is showing the
very simple pixelated representation of the letter. If we start from left top corner `0,0` and start moving clockwise, the trace will look like on the [figure 2](#fig2).

<figure id="fig1" class="center">
  <svg width="216" height="216" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
    <g id="pixels">
      <use x="27" y="27" width="54" height="54" xlink:href="#pixel" />
      <use x="81" y="27" width="54" height="54" xlink:href="#pixel" />
      <use x="135" y="81" width="54" height="54" xlink:href="#pixel" />
      <use x="135" y="135" width="54" height="54" xlink:href="#pixel" />
      <use x="27" y="81" width="54" height="54" xlink:href="#pixel" />
      <use x="27" y="135" width="54" height="54" xlink:href="#pixel" />
    </g>
  </svg>

  <figcaption>
    fig. 1: Our hero: pixelated letter "n".
  </figcaption>
</figure>

<figure id="fig2" class="center">
  <svg width="216" height="216" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">

    <use xlink:href="#pixels" width="216" height="216" y="0" x="0"/>

    <use xlink:href="#move0001" width="54" height="54" y="0" x="0"/>
    <use xlink:href="#move0011" width="54" height="54" y="0" x="54"/>
    <use xlink:href="#move0010" width="54" height="54" y="0" x="108"/>
    <use xlink:href="#move1001" width="54" height="54" y="54" x="108"/>
    <use xlink:href="#move0010" width="54" height="54" y="54" x="162"/>
    <use xlink:href="#move1010" width="54" height="54" y="108" x="162"/>
    <use xlink:href="#move1000" width="54" height="54" y="162" x="162"/>
    <use xlink:href="#move0100" width="54" height="54" y="162" x="108"/>
    <use xlink:href="#move0101" width="54" height="54" y="108" x="108"/>
    <!-- reusing the move1001 -->
    <use xlink:href="#move1110" width="54" height="54" y="54" x="54"/>
    <use xlink:href="#move1010" width="54" height="54" y="108" x="54"/>
    <use xlink:href="#move1000" width="54" height="54" y="162" x="54"/>
    <use xlink:href="#move0100" width="54" height="54" y="162" x="0"/>
    <use xlink:href="#move0101" width="54" height="54" y="108" x="0"/>
    <use xlink:href="#move0101" width="54" height="54" y="54" x="0"/>
  </svg>

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

<figure id="fig3">
  <svg width="27" height="40">
    <use xlink:href="#move0001wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move0011wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move0010wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move1001wl_right" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move0010wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move1010wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move1000wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move0100wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move0101wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move1001wl_left" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move1110wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move1010wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move1000wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move0100wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move0101wl" />
  </svg>
  <svg width="27" height="40">
    <use xlink:href="#move0101wl" />
  </svg>

  <figcaption>
    fig. 3: "n" steps with SVG directions.
  </figcaption>
</figure>

We can notice that <svg width="27" height="27"><use xlink:href="#move1001"></use></svg>
is first `h1` and then `h-1`. The direction in which we'll go depends
from where we're coming. It basically says "turn left".
If we come from above, we go right (`h1`).
If we come from under we go left (`h-1`).
Same goes for <svg width="27" height="27"><use xlink:href="#move0110"></use></svg>
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
  <svg width="186" height="186" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h2v1h1v2h-1v-2h-1v2h-1z" fill="#777777" transform="scale(54)"/>
  </svg>

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
  <svg width="216" height="216" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
    <use xlink:href="#move0001" width="54" height="54" y="0" x="0"/>
    <use xlink:href="#move0010" width="54" height="54" y="0" x="54"/>
    <use xlink:href="#move1000" width="54" height="54" y="0" x="108"/>
    <use xlink:href="#move0100" width="54" height="54" y="0" x="168"/>

    <use xlink:href="#move1110" width="54" height="54" y="54" x="0"/>
    <use xlink:href="#move1101" width="54" height="54" y="54" x="54"/>
    <use xlink:href="#move0111" width="54" height="54" y="54" x="108"/>
    <use xlink:href="#move1011" width="54" height="54" y="54" x="164"/>

    <use xlink:href="#move0011" width="54" height="54" y="108" x="0"/>
    <use xlink:href="#move1100" width="54" height="54" y="108" x="54"/>
    <use xlink:href="#move1010" width="54" height="54" y="108" x="108"/>
    <use xlink:href="#move0101" width="54" height="54" y="108" x="162"/>

    <use xlink:href="#move1001" width="54" height="54" y="162" x="54"/>
    <use xlink:href="#move0110" width="54" height="54" y="162" x="108"/>
  </svg>

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
apparent which ways things go.

<figure id="fig8" class="center">
  <svg width="216" height="216" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
    <use x="27" y="27" width="54" height="54" xlink:href="#pixel" />
    <use x="81" y="27" width="54" height="54" xlink:href="#pixel" />
    <use x="135" y="27" width="54" height="54" xlink:href="#pixel" />
    <use x="135" y="81" width="54" height="54" xlink:href="#pixel" />
    <use x="135" y="135" width="54" height="54" xlink:href="#pixel" />
    <use x="81" y="135" width="54" height="54" xlink:href="#pixel" />
    <use x="27" y="135" width="54" height="54" xlink:href="#pixel" />
    <use x="27" y="81" width="54" height="54" xlink:href="#pixel" />

    <use xlink:href="#move0001" width="54" height="54" y="0" x="0"/>
    <use xlink:href="#move0011" width="54" height="54" y="0" x="54"/>
    <use xlink:href="#move0011" width="54" height="54" y="0" x="108"/>
    <use xlink:href="#move0010" width="54" height="54" y="0" x="162"/>
    <use xlink:href="#move1010" width="54" height="54" y="54" x="162"/>
    <use xlink:href="#move1010" width="54" height="54" y="108" x="162"/>
    <use xlink:href="#move1000" width="54" height="54" y="162" x="162"/>
    <use xlink:href="#move1100" width="54" height="54" y="162" x="108"/>
    <use xlink:href="#move1100" width="54" height="54" y="162" x="54"/>
    <use xlink:href="#move0100" width="54" height="54" y="162" x="0"/>
    <use xlink:href="#move0101" width="54" height="54" y="108" x="0"/>
    <use xlink:href="#move0101" width="54" height="54" y="54" x="0"/>

    <use xlink:href="#move1110" width="54" height="54" y="54" x="54"/>
    <use xlink:href="#move1011" width="54" height="54" y="108" x="54"/>
    <use xlink:href="#move0111" width="54" height="54" y="108" x="108"/>
    <use xlink:href="#move1101" width="54" height="54" y="54" x="108"/>
  </svg>

  <figcaption>
    fig. 8: Inner shape cutting a hole in the outer shape
  </figcaption>
</figure>

Actually, I've discovered this by accident. I wasn't thinking yet
about hole-cutting but while trying to compress the output a bit by
combining paths into one `<path>` element, it "magically" all came into
place. Then I've started researching why it's doing this much rightful
thing :-)

## Colour

First version of [SharpVG] [sharpvg] treated all colours as black. It
was actually trivial to expand it to handle colours: we treat each
colour as a separate 1-bit image. Resulting SVG image will have one
path per colour.

## Summing up

For me, converting pixelated graphics to SVGs and then manipulating
them is perfect because it's quick and fun to create a small pixelated
image and it disguises my lack of proper drawing talent.

SVG is currently quite underused by web developers. During writing
this article I was very pleased with what you can do with it. The ease
of reusing elements from different images is one shiny example: in any
SVG image, we can take anything from another one provided we gave it
an `id` attribute. I makes for a very good solution for creating
resource libraries (sprites). I highly recommend this good read about
the [`<use>` element on Sara Soueidan's blog] [use].

[state]: http://vaughnroyko.com/state-of-nearest-neighbor-interpolation-in-canvas/
[sharpvg]: https://github.com/brainshave/sharpvg
[logo]: http://en.wikipedia.org/wiki/Logo_(programming_language)
[fill]: http://www.w3.org/TR/SVG/painting.html#FillProperties
[use]: http://sarasoueidan.com/blog/structuring-grouping-referencing-in-svg/
