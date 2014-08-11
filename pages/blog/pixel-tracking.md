# Pixel Tracking

London, 2014-08-11.

This post describes a simple algorithm

<figure>
  <object data="pixel-tracking-images/moves.svg" type="image/svg+xml">
    <img src="pixel-tracking-images/moves.png">
  </object>
  <figcaption>Possible moves</figcaption>
</figure>

<figure>
  <object id="pixel_tracking_example"
          data="pixel-tracking-images/example.svg" type="image/svg+xml">
    <img src="pixel-tracking-images/example.png">
  </object>
  <br>
  <label class="meta">
    <input type="checkbox" id="hide_steps">
    Hide steps
  </label>

  <figcaption>
    Example of tracking a pixelated letter "n".<br>
  </figcaption>
  <script>
    (function () {
      document.querySelector("#hide_steps").addEventListener("change", toggle);

      function toggle (event) {
        var steps = document
          .querySelector("#pixel_tracking_example")
          .contentDocument
          .querySelector(".steps")
          .setAttribute(
            "visibility",
            event.target.checked ? "hidden" : ""
          );
      }
    })();
  </script>
</figure>
