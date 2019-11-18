(function () {
'use strict';

//     

var console = self.console;
var LEVELS = Object.freeze({
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    LOG: 4
});
var METHODS = ["error", "warn", "info", "log"];
var SUPPORTED = typeof console !== "undefined" && typeof console.log !== "undefined" && typeof console.error !== "undefined" && typeof console.debug !== "undefined" && typeof console.warn !== "undefined" && typeof Function.prototype.apply === "function"; //IE9+

var defaultLevel = void 0;
var defaultInstance = void 0;

var writeToLog = function writeToLog(logger, method, args) {
    if (SUPPORTED) {
        //silently ignore if not supported
        var mIndex = METHODS.indexOf(method),
            loggerLevel = logger.getLevel();

        if (~mIndex && loggerLevel >= mIndex + 1) {
            console[method].apply(console, args);
        }

        return logger;
    }
};

var writeGroup = function writeGroup(logger, method, title, fallbackTitle) {
    return (
        // $FlowFixMe - doesnt understand groupEnd wont be called with title param
        console[method] ? title ? console[method](title) : console[method]() : logger.log("----------- " + (title || fallbackTitle) + " ----------- ")
    );
};

var createLogger = function createLogger(options) {
    var _level = options.level;

    var logger = {};

    logger.setLevel = function (level) {
        _level = level;
        return logger;
    };

    logger.getLevel = function () {
        return _level || defaultLevel;
    };

    METHODS.forEach(function (m) {
        logger[m] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return writeToLog(logger, m, args);
        };
    });

    logger.groupCollapsed = function (title) {
        return writeGroup(logger, "groupCollapsed", title, "GROUP START");
    };

    logger.group = function (title) {
        return writeGroup(logger, "group", title, "GROUP START");
    };

    logger.groupEnd = function () {
        return writeGroup(logger, "groupEnd", null, "GROUP END");
    };

    logger.debug = logger.log;

    return logger;
};

var getLogger = function getLogger() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    options.level = options.level || LEVELS.NONE;

    var logger = options.newInstance || !defaultInstance ? createLogger(options) : defaultInstance;

    if (!defaultInstance && !options.newInstance) {
        defaultInstance = logger; //first time store the instance for future use
    }

    return logger;
};

var setDefaultLevel = function setDefaultLevel(level) {
    return defaultLevel = level;
};

var ML_WIDGET_EVENTS = {
  init: "ML_WIDGET_INIT",
  show: "ML_WIDGET_SHOW",
  hide: "ML_WIDGET_HIDE",
  error: "ML_WIDGET_ERROR",
  insert: "ML_WIDGET_INSERT_DATA",
  identity: "ML_WIDGET_EXPOSE_IDENTITY"
};

// arguments passed to the cms controller
var AUTHENTICATION_OPTIONS = ["cloud_name", "api_key", "username", "timestamp", "signature", "integration"];

// arguments passed to the auth0 login controller
var AUTH_ZERO_OPTIONS = ["access_token", "redirect_url", "cloud_name"];

// arguments passed to the console
var CONFIGURATION_OPTIONS = ["integration", "inline_container", "z_index", "multiple", "max_files", "default_transformations", "insert_caption", "remove_header", "folder", // folder path and filters
"search", // search query
"collection", // named collection
"asset", // manage page
"transformation" // transform page
];

//      
var logger = getLogger();

var initPostMessage = (function (other, options) {
  var replyTarget = void 0,
      allowedOrigin = Array.isArray(options.allowedOrigin) ? options.allowedOrigin : [options.allowedOrigin];

  var types = options.types;


  var deserializeData = function deserializeData(dataStr, origin) {
    var data = null;

    try {
      data = typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;
    } catch (err) {
      logger.error("[postmessage]: failed to parse data from " + origin, err);
    }

    return data;
  };

  var throwIfNoTarget = function throwIfNoTarget(target) {
    if (!target || !target.length) throw "PostMessage - target not set!";
  };

  var handleMessage = function handleMessage(e) {
    if (~allowedOrigin.indexOf(e.origin)) {
      replyTarget = e.origin;

      var data = deserializeData(e.data, e.origin);

      if (data) {
        if (!options.validator || options.validator(data.data)) {
          if (data.type && types[data.type]) {
            logger.log("[postmessage]: found matching handler for '" + data.type + "' event from: " + e.origin, data.data);
            types[data.type](data.data, data.type, e, options); //call the 'event handler' provided
          }
        }
      }
    }
  };

  var close = function close() {
    return self.removeEventListener("message", handleMessage);
  };
  var send = function send(type, data) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var target = options.target || replyTarget;
    throwIfNoTarget(target);
    try {
      logger.log("[postmessage]: posting message to: " + target);
      if (other instanceof HTMLIFrameElement) {
        other = other.contentWindow;
      }
      other.postMessage(JSON.stringify({ type: type, data: data }), target);
    } catch (err) {
      logger.error("[postmessage]: failed to post message to target: " + target, err);
    }
  };

  throwIfNoTarget(allowedOrigin);
  self.addEventListener("message", handleMessage, false);

  return {
    send: send,
    close: close
  };
});

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

//      
var logger$1 = getLogger();

var initComms = (function (options) {
  return new Promise(function (resolve, reject) {
    var _types;

    var insertHandler = function insertHandler(data) {
      options.callbacks.insertHandler && options.callbacks.insertHandler(data);
    };

    var identityHandler = function identityHandler(data) {
      options.callbacks.identityHandler && options.callbacks.identityHandler(data);
    };

    var errorHandler = function errorHandler(data) {
      options.callbacks.errorHandler && options.callbacks.errorHandler(data);
    };

    var hideHandler = function hideHandler() {
      options.callbacks.hideHandler();
    };

    var validator = function validator(data) {
      return data && data.mlId && data.mlId === options.mlId;
    };

    var pm = initPostMessage(options.ifr, {
      validator: validator,
      allowedOrigin: options.mlUrl.origin,
      types: (_types = {}, defineProperty(_types, ML_WIDGET_EVENTS.insert, insertHandler), defineProperty(_types, ML_WIDGET_EVENTS.identity, identityHandler), defineProperty(_types, ML_WIDGET_EVENTS.hide, hideHandler), defineProperty(_types, ML_WIDGET_EVENTS.error, errorHandler), _types)
    });

    var sendMessage = function sendMessage(type, data) {
      pm.send(type, data, { target: options.mlUrl.origin });
    };

    options.ifr.addEventListener("load", function () {
      sendMessage(ML_WIDGET_EVENTS.init, options);
      options.iframeLoaded();

      resolve({
        sendMessage: sendMessage
      });
    });

    // TODO: handle errors in loading of iframe content
    options.ifr.addEventListener("error", function () {});

    // return { sendMessage };
  });
});

//     

var getElement = function getElement(selectorOrElement) {
  return typeof selectorOrElement === "string" ? document.querySelector(selectorOrElement) : selectorOrElement;
};

var shallowCopy = function shallowCopy(obj) {
  return _extends({}, obj);
};

var filterKeysInObject = function filterKeysInObject(object, keys) {
  return keys.reduce(function (acc, k) {
    return object[k] !== undefined ? _extends({}, acc, defineProperty({}, k, object[k])) : acc;
  }, {});
};

//      

// TODO: link to documentation


(function (win) {
  var mlCounter = 0;

  var debug = win.location.search.indexOf("debug=true") > -1;
  if (debug) {
    setDefaultLevel(LEVELS.LOG);
  }

  var createMediaLibrary = function createMediaLibrary(options, callbacks, element) {
    var ifr = void 0,
        divWrapper = void 0,
        frameReadyPromise = null,
        isShowing = false,
        isReady = false,
        inlineMode = !!options.inline_container,
        bodyOverflow = null,
        authZeroLoginRequired = !!options.access_token;

    var mlId = "ml_" + mlCounter;
    mlCounter += 1;

    // private
    var escapeHandler = function escapeHandler(e) {
      if (e.keyCode === 27) {
        mlApi.hide();
      }
    };

    var baseUrl = function () {
      var protocol = "https://";
      var host = void 0;
      if (options.dev === true) {
        host = "dev.cloudinary.com";
      } else if (options.nightly === true) {
        host = "nightly.cloudinary.com";
      } else if (options.staging === true) {
        host = "staging.cloudinary.com";
      } else {
        host = "cloudinary.com";
      }

      return protocol + host;
    }();

    var buildUrl = function buildUrl(endpoint, options, queryParamsKeys) {
      var additionalQueryParams = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var getUrlParams = function getUrlParams() {
        var params = [];
        Object.keys(additionalQueryParams).forEach(function (opt) {
          return params.push(opt + "=" + additionalQueryParams[opt]);
        });
        queryParamsKeys.filter(function (opt) {
          return Boolean(options[opt]);
        }).forEach(function (opt) {
          return params.push(opt + "=" + encodeURIComponent(options[opt]));
        });
        return params;
      };

      var urlParams = getUrlParams();

      var href = baseUrl + endpoint + "?" + urlParams.join("&");

      return {
        origin: baseUrl,
        href: href
      };
    };

    var onWidthChange = function onWidthChange(mq) {
      window.requestAnimationFrame(function () {
        divWrapper.style.padding = mq.matches ? "25px" : "25px 0";
      });
    };

    var initElement = function initElement(ele) {
      var button = win.document.createElement("button");

      ele.style.display = "none";
      button.setAttribute("class", options.button_class || "cloudinary-button");
      button.innerHTML = options.button_caption || "Open Media Library";
      ele.parentNode.insertBefore(button, ele.previousSibling);

      button.addEventListener("click", function (e) {
        showCms();

        if (e && e.preventDefault) {
          e.preventDefault();
        }

        if (e && e.stopPropagation) {
          e.stopPropagation();
        }

        return false;
      }, false);
    };

    var initIframe = function initIframe(href) {
      // iframe
      ifr = win.document.createElement("iframe");

      ifr.setAttribute("src", href);
      ifr.setAttribute("frameborder", "no");
      ifr.setAttribute("allow", "camera");

      if (inlineMode) {
        ifr.setAttribute("width", "100%");
        ifr.setAttribute("height", "100%");
        ifr.style.border = "none";
      } else {
        ifr.setAttribute("width", "100%");
        ifr.setAttribute("height", "100%");
        ifr.style.boxShadow = "0 0 50px rgba(0, 0, 0, 0.8)";
      }

      if (!inlineMode) {
        // iframe wrapper
        divWrapper = win.document.createElement("div");
        divWrapper.style.position = "fixed";
        divWrapper.style.top = "0";
        divWrapper.style.left = "0";
        divWrapper.style.height = "100%";
        divWrapper.style.width = "100%";
        divWrapper.style.boxSizing = "border-box";
        divWrapper.style.backgroundColor = "rgba(0,0,0,0.5)";
        divWrapper.style.zIndex = options.z_index || 99999;

        // support responsive display of ML
        if (matchMedia) {
          var mq = window.matchMedia("(min-width: 700px)");
          mq.addListener(onWidthChange);
          onWidthChange(mq); // initialization
        }

        // use 'visibility' instead of 'display' to workaround https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        divWrapper.style.visibility = "hidden";

        divWrapper.appendChild(ifr);
      }
    };

    var getWidgetContainer = function getWidgetContainer(options) {
      var container = document.body;

      if (inlineMode) {
        container = options.inline_container;

        if (typeof container === "string") {
          container = document.querySelector(container);
        }
      }

      if (!container) {
        throw "Element Not Found (" + options.inline_container + ")";
      }

      return container;
    };

    var injectIframe = function injectIframe(options) {
      var element = inlineMode ? ifr : divWrapper;
      var mlContainer = getWidgetContainer(options);
      mlContainer.appendChild(element);
      ifr.focus();
    };

    var toggleIframe = function toggleIframe() {
      var element = inlineMode ? ifr : divWrapper;
      if (isReady && isShowing) {
        element.style.visibility = "visible";
        element.focus();
        !inlineMode && win.document.addEventListener("keyup", escapeHandler);
      } else {
        element.style.visibility = "hidden";
        win.document.removeEventListener("keyup", escapeHandler);
      }
    };

    var iframeLoaded = function iframeLoaded() {
      isReady = true;
      toggleIframe();
    };

    var showCms = function showCms() {
      if (!inlineMode && document.body) {
        if (bodyOverflow === null) {
          bodyOverflow = document.body.style.overflow;
        }
        document.body.style.overflow = "hidden";
      }
      isShowing = true;
      toggleIframe();
    };

    var hideCms = function hideCms() {
      if (!inlineMode && document.body) {
        if (bodyOverflow !== null) {
          document.body.style.overflow = bodyOverflow;
          bodyOverflow = null;
        }
      }
      isShowing = false;
      toggleIframe();
    };

    var insertHandler = inlineMode ? callbacks.insertHandler : function (data) {
      callbacks.insertHandler(data);
      hideCms();
    };

    var init = function init() {
      var cmsOptions = shallowCopy(options);
      var mlUrl = buildUrl("/console/media_library/cms", cmsOptions, AUTHENTICATION_OPTIONS, {
        pmHost: 'about:srcdoc',
        new_cms: true,
        ml_id: mlId
      });
      var ifrHref = authZeroLoginRequired ? buildUrl("/console/api/v1/auth/login_with_oauth_token", _extends({}, options, {
        redirect_url: mlUrl.href
      }), AUTH_ZERO_OPTIONS).href : mlUrl.href;
      cmsOptions.mlUrl = mlUrl;
      cmsOptions.callbacks = callbacks;

      if (element) {
        initElement(getElement(element));
      }

      initIframe(ifrHref);
      frameReadyPromise = initComms({
        ifr: ifr,
        mlId: mlId,
        mlUrl: mlUrl,
        callbacks: _extends({}, callbacks, {
          // should hide modal after Insertion in case of Modal mode
          insertHandler: insertHandler,
          hideHandler: hideCms
        }),
        iframeLoaded: iframeLoaded,
        config: filterKeysInObject(cmsOptions, CONFIGURATION_OPTIONS)
      });
      injectIframe(cmsOptions);
    };

    init();

    // public
    var mlApi = {
      show: function show() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        frameReadyPromise.then(function (comms) {
          comms.sendMessage(ML_WIDGET_EVENTS.show, {
            mlId: mlId,
            options: _extends({}, options, { config: options }), // temporary support internal 'config' level - should be removed after console deployment
            config: options
          });
          showCms();
        });
        return this;
      },
      hide: function hide() {
        frameReadyPromise.then(function (comms) {
          comms.sendMessage(ML_WIDGET_EVENTS.hide, {
            mlId: mlId
          });
          hideCms();
        });
        return this;
      }
    };

    return mlApi;
  };

  win.cloudinary = win.cloudinary || {};

  win.cloudinary.openMediaLibrary = function (options, callbacks, element) {
    return createMediaLibrary(options, callbacks, element).show(options);
  };

  win.cloudinary.createMediaLibrary = function (options, callbacks, element) {
    return createMediaLibrary(options, callbacks, element);
  };
})(self);

}());
