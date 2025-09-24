define(['polyfill'], function(isPollyfilled) {
  var Core = {};

  // Utilidades generales
  Core.throttle = function(fn, time) {
    var last = 0;
    return function() {
      var now = new Date();
      if ((now - last) > time) {
        last = now;
        return fn.apply(this, arguments);
      }
    }
  };

  Core.debounce = function(fn, time) {
    var timerId;
    return function() {
      var args = arguments;
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(bind(this, function() {
        fn.apply(this, args);
      }), time);
    }
  };

  Core.once = function(fn) {
    var executed = false;
    return function() {
      if (!executed) {
        executed = true;
        return fn.apply(this, arguments);
      }
    }
  };

  Core.memoize = function(fn) {
    var cache = {};
    return function(p) {
      var key = JSON.stringify(p);
      if (!(key in cache)) {
        cache[key] = fn.apply(this, arguments);
      }
      return cache[key];
    }
  };

  Core.after = function(fn, n) {
    var times = 0;
    return function() {
      times++;
      if (times % n == 0) {
        return fn.apply(this, arguments);
      }
    }
  };


  Core.bind = function(ctx, fn) {
    return function() {
      return fn.apply(ctx, [].slice.call(arguments));
    }
  };


  Core.curry = function(fn) {
    var oldargs = [].slice.call(arguments, 1);
    return function() {
      var newargs = [].slice.call(arguments);
      return fn.apply(this, oldargs.concat(newargs));
    }
  };

  Core.augment = function(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
      for (var prop in source)
        if (source.hasOwnProperty(prop)) {
          target[prop] = source[prop];
        }
    });
    return target;
  };

  Core.merge = function() {
    var sources = [].slice.call(arguments);
    return Core.augment.apply(this, [{}].concat(sources));
  };

  Core.clone = function(orig) {
    function F() {}
    F.prototype = orig;
    return new F();
  };
  Core.pick = function(obj) {
    var keys = [].slice.call(arguments, 1),
      target = {};
    keys.forEach(function(key) {
      if (obj.hasOwnProperty(key)) target[key] = obj[key];
    });
    return target;
  };

  // Herencia clásica y mixins
  var ProJS = (function(my) {

    function mixin(target, source) {
      for (var prop in source)
        if (source.hasOwnProperty(prop)) {
          if (!target[prop]) {
            target[prop] = source[prop];
          }
        }
    }

    var Class = function() {};

    Class.include = function(m) {
      mixin(this, m);
      if (m.included) {
        m.included(this);
      }
    };
    Class.mixin = function(m) {
      mixin(this.prototype, m);
      if (m.mixed) {
        m.mixed(this);
      }
    };

    Class.extend = function(prop) {
      var _super = this.prototype;

      function F() {}
      F.prototype = _super;
      var proto = new F();

      for (var name in prop) {
        if (typeof prop[name] === 'function' &&
          typeof _super[name] === 'function' &&
          prop[name].constructor === Function &&
          _super[name].constructor === Function) {
          proto[name] = (function(name, fn) {
            return function() {
              var tmp = this._super;
              this._super = _super[name];
              var ret = fn.apply(this, arguments);
              this._super = tmp;
              return ret;
            }
          })(name, prop[name]);
        } else {
          proto[name] = prop[name];
        }
      }

      function Klass() {
        if (this.init) return this.init.apply(this, arguments);
      }

      // Heredamos las propiedades de clase
      for (var classProp in this)
        if (this.hasOwnProperty(classProp)) {
          Klass[classProp] = this[classProp];
        }

      Klass.prototype = proto;
      Klass.prototype.constructor = Klass;

      return Klass;
    };

    // The global super-constructor, wich does
    // nothin gexcept being the top of the chain
    Class.prototype.init = function() {};

    my.Class = Class;

    return my;

  }(ProJS || function() {}));

  // Namespace

  var ProJS = (function(my) {
    my.namespace = function(string, sandbox) {
      var spaces = string.split('.'),
        root = this,
        space;
      while (space = spaces.shift()) {
        root = root[space] || (root[space] = {});
      }
      return sandbox(root);
    };
    return my;
  }(ProJS || {}));

  // Mixins

  var ProJS = (function(my) {

    // Observable

    my.Observable = {
      mixed: function(klass) {
        var klass_init = klass.prototype.init || function() {};
        klass.prototype.init = function() {
          this._subscribers = {};
          return klass_init.apply(this, arguments);
        };
      },
      on: function(event, callback, ctx) {
        if (typeof event != 'string') return this._onMany(event);
        this._subscribers[event] || (this._subscribers[event] = []);
        this._subscribers[event].push({
          cb: callback,
          ctx: ctx || {}
        });
        return this;
      },
      _onMany: function(desc) {
        for (key in desc) {
          this.on(key, desc[key]);
        }
      },
      off: function(event, callback) {
        var subs = this._subscribers[event];
        if (!subs) {
          return;
        }
        for (var i = 0; i < subs.length; i++) {
          if (subs[i].cb === callback) {
            subs.splice(i, 1);
            break;
          }
        }
        return this;
      },
      trigger: function(event) {
        var args = [].slice.call(arguments),
          eventArgs = args.slice(1),
          subscribers = this._subscribers[event] || [],
          subscribersToAll = this._subscribers['*'] || [];
        subscribers.forEach(function(sub) {
          sub.cb.apply(sub.cbx, eventArgs);
        });
        subscribersToAll.forEach(function(sub) {
          sub.cb.apply(sub.ctx, args);
        });
      }
    };


    // Mediable

    my.Mediable = {
      setMediator: function(mediator) {
        this._mediator = mediator;
      },
      notify: function(event) {
        if (this._mediator)
          return this._mediator.trigger.apply(this._mediator, arguments);
      }
    };

    return my;
  }(ProJS || {}));

  // Mediator

  var ProJS = (function(my) {
    my.Mediator = ProJS.Class.extend({
      init: function(desc) {
        if (desc) desc.call({}, this);
      },
      add: function() {
        var elems = [].slice.call(arguments);
        elems.forEach(Core.bind(this, function(e) {
          if (e.setMediator) e.setMediator(this)
        }));
      }
    });
    my.Mediator.mixin(ProJS.Observable);

    return my;
  }(ProJS || {}));

  Core.ProJS = ProJS || {};

  return Core;
});