// Offer installation.
// Handle updates.
define(function() {
  var Const = require(["js/const.js"]);

  var LOG = window.console.log.bind(window.console, "installer");

  if ("mozApps" in window.navigator && !document.URL.startsWith("file:")) {
    LOG("Checking whether we need to install/upgrade");
    var request = window.navigator.mozApps.getInstalled();
    request.onerror = function() {
      LOG("Cannot determine whether application is installed", request.error);
    };
    request.onsuccess = function() {
      LOG("getInstalled", request.result);
      for (var app of request.result) {
        LOG("getInstalled", "checking", app);
        if (app.manifest.name == Const.appname) {
          var updateRequest = app.checkForUpdate();
          updateRequest.onsuccess = function() {
            LOG("Update executed", updateRequest);
          };
          updateRequest.onerror = function() {
            LOG("Update failed", updateRequest);
          };
          return;
        }
      }
      LOG("Application isn't installed yet", request);
      LOG("Setting up installer", request);
      var uri = document.URL;
      uri = uri.substring(0, uri.lastIndexOf("/")) + "/meta/editor.webapp";
      var request2 = window.navigator.mozApps.install(uri);
      request2.onsuccess = function() {
        LOG("Installation successful");
      };
      request2.onerror = function(e) {
        LOG("Installation failed", e);
      };
    };
  }
  return {};
});