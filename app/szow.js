ns("szywon.szow", function () {
  this.fns(start);

  var array = use("szywon.utils.array");

  function start () {
    var content = document.getElementById("content");

    var elements = array(content.children);

    var sections = [];

    elements.forEach(function (element) {
      var name = element.nodeName;

      var section = sections[sections.length - 1];
      var section_content;

      if (!section || name === "H1" || name === "HR") {
        section = document.createElement("section");
        sections.push(section);
        section_content = document.createElement("div");
        section_content.className = "wrap";
        section.appendChild(section_content);
      }

      section_content = section.children[0];

      if (element.nodeName === "HR") {
        content.removeChild(element);
      } else if (name !== "SCRIPT") {
        section_content.appendChild(element);
      }
    });

    sections.forEach(function (section) {
      content.appendChild(section);
    });
  }
});
