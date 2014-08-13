# Pixel tracing

London, 2014-08-20.

There are many reasons to use SVG: for sprites, fonts, vector
graphics, etc. Currently developers are not giving it enough credit
(we're catching up). The reason we'll be focusing here is somewhat
different. After some research [source!] and experimentation it turns
out it might be also the best way to serve pixel art. Why?  Because
all other options require either `<canvas>`+JavaScript hacks or don't
work in all browsers (CSS solutions).

This post describes a simple algorithm that [SharpVG] [sharpvg] uses to trace
pixel shapes.

## The idea

The key thing which came from intuition (which came
probably from some earlier experience with path-finding algorithms at
my uni) was to, for every dot between four pixels (a corner), find all
possible situations ([fig. 1](#fig1)) and decide where the path will follow.

<figure id="fig1">
  <object data="pixel-tracing-images/moves.svg" type="image/svg+xml">
    <img src="pixel-tracing-images/moves.png">
  </object>
  <figcaption>
    fig. 1: Possible moves
  </figcaption>
</figure>

My first attempt was actually a bit different: each arrow was
double-ended and before the decision where to go next I was basically
picking any move that wasn't going immediately going back. That didn't
help because in some cases I got into infinite loops anyway. We would
need to check *all* previous moves.

So my second approach was to have only one possible move for every
situation with two exceptions which I'll mention in a second. I've
assumed clockwise direction when going around an object. That
simplified the whole thing because we don't need to consider all
previous moves any more.

The two exceptions are the last two moves from the
[fig. 1](#fig1). Instead of telling exactly which way to go
they basically say "turn left" so for these we calculate the move from
the previous one.

The algorithm finds the first corner that has any of the known
situations and follows the shape around to the beginning.

As an example, lets trace the letter "n" in it's simplest pixelated
form ([fig. 2](#fig2)).

<figure id="fig2">
  <object id="pixel_tracing_example"
          data="pixel-tracing-images/n.svg" type="image/svg+xml">
    <img src="pixel-tracing-images/n.png">
  </object>

  <figcaption>
    fig. 2: Our hero: pixelated letter "n".
  </figcaption>
</figure>

Now if we try to apply the moves to the letter "n" we'll get what's on
[fig. 3](#fig3).

<figure id="fig3">
  <object id="pixel_tracing_example"
          data="pixel-tracing-images/steps.svg"
          type="image/svg+xml"
          style="position: absolute; z-index: 1;">
    <img src="pixel-tracing-images/steps.png">
  </object>
  <object id="pixel_tracing_example"
          data="pixel-tracing-images/n.svg"
          type="image/svg+xml">
    <img src="pixel-tracing-images/n.png">
  </object>

  <figcaption>
    fig. 3: Steps of going around the letter "n".
  </figcaption>
</figure>

The tracing ends once we get back to the starting point, i.e. we
"close the loop".

## Algorithm outline

One path is not enough. Almost any picture has more than one shapes
that need to be traced. We know what happens once we found a starting
point for a path but we need to find them all.

One the higher level, the algorithm looks like this:

1. Scan the image, start with point `0,0`, going through every
row. Once a corner is found, start tracing.

2. Trace the shape, marking every point we go through as *visited*.

3. Continue scanning until we find another corner that was not yet
*visited* or until we reach end of the image.

   1. If an unvisited corner is found, trace the new shape. (goto 2)
   2. If we reach end of the image, finish.

Marking as *visited* is necessary so that we never trace the same
shape twice (from a different starting point, for example).

## Colour

Until now, we've been dealing with 1-bit images. Colour is actually
easy. We just need treat each colour as a separate image. For that,
SharpVG is actually splitting them to 1-bit images for each colour and
then pushing through the algorithm. (This might change in the future
as it's quite memory-hungry but the concept will remain: treat each
colour as a separate image.)

## Shapes with holes in them

Some shapes, like letter "o", will be detected as two separate shapes
(one for the external circle, one for the internal one). Normally that
would result in the internal shape being overlapped by the external
one. But if we put them as one path in SVG we can leverage the
`nonzero` fill rule. More on this in the [SVG documentation on fill
properties] [fill_props].

## To SVG paths

Paths in SVG are represented by (surprise!) the `<path>` element. Two
attributes we're interested in are `d` and `fill`. `d` is the *data*
of the path, basically the path's shape definition. It's a
mini-language on its own right and it describes the directions where
to go to paint every point of the path. (If you know LOGO and you're
thinking turtles now, you're not very far from what `d` is.)

Each shape (one per colour) will be reflected in the final SVG by one
path. Each starting point of the shape will be represented as `Mx y`
where x and y pair is the position of the starting point. SVG already
has notion of relative moves (lowercase `h` and `v` in the path
definition). That's makes it easy, once we have a path encoded as
series of moves, to convert to SVG path.

For example a simple square from point `3,5` will look like this:

    M3 5h1v1h-1v-1

Each `<path>` element will consist of all shapes for the given colour
of the image. (So it will have multiple `M` starting points.)

Last part is compression of the path. For example if we have a
straight line many-pixels long, we'll have something like:

    …h1h1h1h1v-1v-1v-1…

Instead it's better to have:

    …h4v-3…

Right? It has another advantage: sometimes our input will be already
scaled up version of the image. This way we don't need to scale it
down to one-pixel per square size to have a sane file size on the
resulting SVG.

## Wrapping up

Illustrations for this article started as hand-pixelled GIFs in
GIMP. I figured out that I can just draw four different moves, convert
them to SVG and then compose with rotations (by hand, it's not that
scary actually). This is how [fig. 1](#fig1) was created (check out
its source). Each row is the same shape replicated four times. I
recommend these articles by [Sara Soueidan] [sara] on the [reusing
shapes] [use] and on [transformations] [trans].

All described steps are coded in the SharpVG.

[sharpvg]: https://github.com/brainshave/sharpvg
[fill_props]: http://www.w3.org/TR/SVG/painting.html#FillProperties
[sara]: http://sarasoueidan.com/
[use]: http://sarasoueidan.com/blog/structuring-grouping-referencing-in-svg/
[trans]: http://sarasoueidan.com/blog/svg-transformations/
