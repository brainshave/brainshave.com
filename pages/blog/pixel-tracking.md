# Pixel Tracking

London, 2014-08-11.

There are many reasons to use SVG: for sprites, fonts, vector
graphics, etc. The reason we'll be focusing here is somewhat
different. After some research [source!] and experimentation it turns
out it might be also the best way to serve pixel art. Why? Because all
other options require either `<canvas>`+JavaScript hacks or don't work
in all browsers (CSS solutions).



<figure>
  <object data="pixel-tracking-images/moves.svg" type="image/svg+xml">
    <img src="pixel-tracking-images/moves.png">
  </object>
  <figcaption>Possible moves</figcaption>
</figure>

<figure>
  <object id="pixel_tracking_example"
          data="pixel-tracking-images/n.svg" type="image/svg+xml">
    <img src="pixel-tracking-images/n.png">
  </object>

  <figcaption>
    Our hero: pixelated letter "n".<br>
  </figcaption>
</figure>

<figure>
  <object id="pixel_tracking_example"
          data="pixel-tracking-images/steps.svg"
          type="image/svg+xml"
          style="position: absolute; z-index: 1;">
    <img src="pixel-tracking-images/steps.png">
  </object>
  <object id="pixel_tracking_example"
          data="pixel-tracking-images/n.svg"
          type="image/svg+xml">
    <img src="pixel-tracking-images/n.png">
  </object>

  <figcaption>
    Steps of going around the letter "n".<br>
  </figcaption>
</figure>
