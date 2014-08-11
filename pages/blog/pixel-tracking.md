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
  <figcaption>
    Example of tracking a pixelated letter "n".<br>
    <label>
      <input type="checkbox" id="show_steps" checked="true">
      Show steps
    </label>
  </figcaption>
  <script>
    (function () {
      document.querySelector("#show_steps").addEventListener("change", toggle);

      function toggle (event) {
        var steps = document
          .querySelector("#pixel_tracking_example")
          .contentDocument
          .querySelector(".steps")
          .setAttribute(
            "visibility",
            event.srcElement.checked ? "" : "hidden"
          );
      }
    })();
  </script>
</figure>
