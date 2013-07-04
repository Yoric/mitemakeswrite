define(['js/elements.js', 'libs/promise/core.js'], function(Elements, Promise) {
  var indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB;

  var LOG = window.console.log.bind(window.console, "db");

  var exports = {};

  // Loading
  var db;
  var deferInitialized = (function() {
    LOG("Initializing");
    var deferred = Promise.defer();
    LOG(1);

    var request = indexedDB.open("mite", 3);
    LOG(2);

    function showReady() {
      var state = request.readyState;
      LOG("Request readyState", state);
      if (state != "done") {
        window.setTimeout(showReady, 500);
      }
    }
    showReady();

    request.onupgradeneeded = function(event) {
      LOG("upgrade needed");
      // Set the database structure
      var db = event.target.result;

      /**
       * A mapping from {int} id to
       * - {string} source (HTML)
       */
      try {
        db.createObjectStore("documents", {keyPath: "id"});
      } catch (ex if ex instanceof ConstraintError) {
        // Disregard constraint errors, that's just
      }

      /**
       * The list of documents.
       * - documents: array of
       *   - {string} name
       *   - {int} id
       * - idgen: number
       */
      try {
        db.createObjectStore("index");
      } catch (ex if ex instanceof ConstraintError) {
      }
      LOG("upgrade complete");
    };
    request.onsuccess = function(event) {
      LOG("open success", event);
      db = event.target.result;
      deferred.resolve();
    };
    request.onerror = function(e) {
      LOG("open failed", e);
      deferred.reject(e);
    };
    request.onblocked = function(e) {
      LOG("open blocked", e);
    };
    LOG(4);
    return deferred.promise;
  })();

  /**
   * resolves to
   * |undefined|
   * or
   * {
   *  {string} source
   * }
   */
  exports.load = function(id = 0) {
    LOG("docload requested");
    return deferInitialized.then(function() {
      LOG("docload starting");
      var deferred = Promise.defer();
      var request = db.
        transaction(["documents"]).
        objectStore("documents").
        get(id);
      LOG("request started");
      request.onsuccess = function(event) {
        LOG("docload succeeded", event.target.result);
        deferred.resolve(event.target.result);
      };
      request.onerror = function(event) {
        LOG("docload failed");
        deferred.reject(event);
      };
      LOG("docload launched");
      return deferred.promise;
    });
  };

  exports.save = function(source, id = 0) {
    LOG("docsave requested", source, id);
    return deferInitialized.then(function() {
      LOG("initialization complete");
      var deferred = Promise.defer();
      var request = db.
        transaction(["documents"], "readwrite").
        objectStore("documents").
        put({source: source, id: id});
      // FIXME: Should also update the index
      request.onsuccess = function(event) {
        LOG("docsave", id, "complete", source);
        deferred.resolve(event.target.result);
      };
      request.onerror = function(event) {
        LOG("docsave", id, "failed", source);
        deferred.reject(event);
      };
      return deferred.promise;
    });
  };

  LOG("exporting", Object.keys(exports));
  return exports;
});