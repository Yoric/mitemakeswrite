// Offer installation.
// Handle updates.
define(function() {
  var Const = require(["js/const.js"]);

  if ("mozApps" in window.navigator) {
    var request = window.navigator.mozApps.getInstalled();
    request.onerror = function() {
      console.log("Cannot determine whether application is installed", request.error);
    };
    request.onsuccess = function() {
      console.log("getInstalled", request.result);
      for (var app of request.result) {
        console.log("getInstalled", "checking", app);
        if (app.manifest.name == Const.appname) {
          var updateRequest = app.checkForUpdate();
          updateRequest.onsuccess = function() {
            console.log("Update executed", updateRequest);
          };
          updateRequest.onerror = function() {
            console.log("Update failed", updateRequest);
          };
          return;
        }
      }
      console.log("Application isn't installed yet", request);
      console.log("Setting up installer", request);
      var uri = document.URL;
      uri = uri.substring(0, uri.lastIndexOf("/")) + "/meta/editor.webapp";
      var request2 = window.navigator.mozApps.install(uri);
      request2.onsuccess = function() {
        console.log("Installation successful");
      };
      request2.onerror = function(e) {
        console.log("Installation failed", e);
      };
    };
  }
  return {};
});