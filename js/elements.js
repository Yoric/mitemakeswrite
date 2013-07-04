define(function() {

  var elements = {
    main: document.getElementById("main"),
    editor: document.getElementById("editor")
  };

  // Handle fullscreen

  function enterFullScreen() {
    if (document.URL.startsWith("file:")) {
      return;
    }
    for (var method of ["requestFullscreen", "mozRequestFullScreen", "webkitRequestFullscreen"]) {
      if (method in elements.main) {
        elements.main[method]();
        return;
      }
    }
  }

  elements.main.addEventListener("click", enterFullScreen);
  elements.main.addEventListener("keypressed", enterFullScreen);

  return elements;
});