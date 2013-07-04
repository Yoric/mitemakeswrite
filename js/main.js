require(["js/console.js", "js/install.js", "js/elements.js", "js/const.js", "js/db.js"],
  function(Console, Install, Elements, Const, Db) {
  "use strict";

  var LOG = window.console.log.bind(window.console, "main");

  // Handle reload
  Db.load().then(function(doc) {
    LOG("Loaded", doc);
    doc = doc || { source: "" };
    Elements.editor.innerHTML = doc.source;
    Elements.editor.contentEditable = "true";
  }, function(e) {
    LOG("Cannot load", e, Object.keys(e));
  });

  // Handle auto-save
  var saver = null;
  Elements.editor.addEventListener("keyup", function() {
    if (!saver) {
      LOG("Adding saver");
      saver = window.setTimeout(function() {
        LOG("Timeout spent, saving", Elements.editor.innerHTML);
        try {
          Db.save(Elements.editor.innerHTML).then(
            function() {
              LOG("Saving succeeded");
            },
            function(e) {
              LOG("Saving failed", e);
            }).then(
              function() {
                LOG("Resetting saver");
                saver = null;
              }
            );
          LOG("Launched save");
        } catch (ex) {
          LOG("Could not launch save", ex);
        }
      }, Const.delaySave_ms);
    } else {
      LOG("Not adding saver", saver);
    }
  });
  window.addEventListener("beforeunload", function(event) {
    LOG("Attempting late save");
    Db.save(Elements.editor.innerHTML);
  });
})();
