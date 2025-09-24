(function(window) {
    if (typeof window.log === "undefined") {
      window.log = {
        create_log: function(name) {
          this[name] = {
            error: function() {},
            warn: function() {},
            info: function() {}
          }
        }
      };
    }

    if (typeof define === "function" && define.amd) {
      define("logger/log", [], function() {
        return window.log;
      });
    }

})(window)