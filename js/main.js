require(["js/install.js", "js/elements.js", "js/const.js", "js/db.js"],
  function(Install, Elements, Const, Db) {
  "use strict";

  require();

  // Handle reload
  Db.load().then(function(doc) {
    doc = doc || { source: "" };
    Elements.editor.innerHTML = doc.source;
  }, function(e) {
    console.log("Cannot load", "" + e);
  });

  // Handle auto-save
  var saver = null;
  Elements.editor.addEventListener("keyup", function() {
    if (!saver) {
      saver = window.setTimeout(function() {
        console.log("Timeout spent, saving", Elements.editor.innerHTML);
        Db.save(Elements.editor.innerHTML).then(
          function() {
            console.log("Saving succeeded");
          },
          function(e) {
            console.log("Saving failed", e);
          }).then(
            function() {
              saver = null;
            }
          );
      }, Const.delaySave_ms);
    }
  });
})();
