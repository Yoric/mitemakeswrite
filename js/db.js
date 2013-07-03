define(['js/elements.js', 'libs/promise/core.js'], function(Elements, Promise) {
  console.log("Elements", Elements, Object.keys(Elements));
  console.log("Promise", Promise, Object.keys(Promise));

  var indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB;

  var exports = {};

  // Loading
  var db;

  var deferInitialized = (function() {
    var deferred = Promise.defer();

    var request = indexedDB.open("mite", 1);

    request.onupgradeneeded = function(event) {
      // Set the database structure
      var db = event.target.result;

      /**
       * A mapping from {int} id to
       * - {string} source (HTML)
       */
      db.createObjectStore("documents", {keyPath: "id"});

      /**
       * The list of documents.
       * - documents: array of
       *   - {string} name
       *   - {int} id
       * - idgen: number
       */
      db.createObjectStore("index");
      console.log("db", "upgrade complete");
    };
    request.onsuccess = function(event) {
      console.log("db", "open complete");
      db = event.target.result;
      deferred.resolve();
    };
    request.onerror = function(e) {
      console.log("db", "open failed", e);
      deferred.reject(e);
    };

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
    return deferInitialized.then(function() {
      console.log("db", "docload starting");
      var deferred = Promise.defer();
      var request = db.
        transaction(["documents"]).
        objectStore("documents").
        get(id);
      console.log("db", "request started");
      request.onsuccess = function(event) {
        console.log("db", "docload succeeded", event);
        deferred.resolve(event.target.result);
      };
      request.onerror = function(event) {
        console.log("db", "docload failed");
        deferred.reject(event);
      };
      console.log("db", "docload launched");
      return deferred.promise;
    });
  };

  exports.save = function(source, id = 0) {
    return deferInitialized.then(function() {
      var deferred = Promise.defer();
      var request = db.
        transaction(["documents"], "readwrite").
        objectStore("documents").
        put({source: source, id: id});
      // FIXME: Should also update the index
      request.onsuccess = function(event) {
        deferred.resolve(event.target.result);
      };
      request.onerror = function(event) {
        deferred.reject(event);
      };
      return deferred.promise;
    });
  };

  return exports;
});