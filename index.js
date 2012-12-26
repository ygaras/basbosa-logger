(function(root, factory) {
  if (typeof exports !== 'undefined') {
    // Node.js
    module.exports = factory(root);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function() {
      // If Basbosa is loaded, do not register a global logger
      if (typeof Basbosa === 'undefined') {
        return root.Logger = factory(root);
      }
      return factory(root);
    });
  } else {
    // Browser globals
    root.Logger = factory(root);
  }
}(this, function(root) {

  /**
   * SERVER: true if this code is running server-side, false if client-side
   */
  var SERVER = typeof (exports) !== 'undefined', instance;

  /**
   * 
   * colors (boolean, default true) - specifies whether to use colors for log
   * levels or not enabled (boolean, default tue) - specifies whether the logger
   * is enabled to output messages or not showTime (boolean, default true) -
   * specifies whether a time stamp should be output with log messages or not
   * showPath (boolean, default true) - specifies whether a path to the file
   * logging the message shoud be output with it level (int, default 3) -
   * specifies the highest log level to be output (***indexing is zero-based***)
   * stringifyObjects (boolean, default false) - Used on browsers without ability to log objects in console
   * uiLogger (boolean, true) - Enable or disable on screen custom logger,
   * usefull on mobile and tablets requires jquery
   * 
   */
  var defaultOptions = {
    colors : SERVER ? true : false,
    enabled : true,
    showTime : true,
    showPath : true,
    level : 2,
    stringifyObjects : false,
    uiLogger : true
  };

  /**
   * Log levels.
   */
  var levels = [ 'error', 'warn', 'info', 'debug', 'trace' ];

  /**
   * Colors for log levels.
   */
  var colors = [ 31, 33, 36, 90, 90 ];

  /**
   * Converts an enumerable to an array.
   * 
   * @api public
   */
  var toArray = function(enu) {
    var arr = [];

    for ( var i = 0, l = enu.length; i < l; i++)
      arr.push(enu[i]);

    return arr;
  };

  /**
   * Pads the nice output to the longest log level.
   */
  function pad(str) {
    var max = 0;

    for ( var i = 0, l = levels.length; i < l; i++)
      max = Math.max(max, levels[i].length);

    if (str.length < max)
      return str + new Array(max - str.length + 1).join(' ');

    return str;
  }
  ;

  /**
   * Logger class optional argument to constructor (if not included, defaults
   * options are applied):
   * 
   * @api public
   */
  var Logger = function(opts) {
    this.setOptions(opts);
    this.initUiLogger();
  };

  /**
   * setOptions method to update logger options after initialization
   * 
   */
  Logger.prototype.setOptions = function(opts) {
    // Auto populate logging level
    if (typeof Basbosa !== 'undefined' && typeof Basbosa('Config') !== 'undefined') {
      defaultOptions.level = Basbosa('Config').get('logging');
    }
    typeof Config != 'undefined' && Config.logging != 'undefined'
        && (defaultOptions.level = Config.logging);
    if (typeof BasbosaConfig != 'undefined') {
      if (BasbosaConfig.logging != 'undefined')
        defaultOptions.level = BasbosaConfig.logging;

      // on iphone, no support for multiple arguments to console.log
      // function
      // if (BasbosaConfig.agent.family == 'iPhone') opts.poorLogger = true;
    }
    opts = opts || {}; // make this argument optional
    for ( var optKey in defaultOptions) {
      this[optKey] = typeof (opts[optKey]) === 'undefined' ? defaultOptions[optKey] : opts[optKey];
    }
    // _.extend(this, defaultOptions, opts);
  };

  Logger.prototype.initUiLogger = function() {
    var $buttonMax, $buttonClose, self =this;

    if (typeof $ === 'undefined' || !this.uiLogger) return;
    
    $(function() {
      if (!self.uiLogger) return;
      $('body').append($('<div>').addClass('basbosa-logger').css({
        'position' : 'fixed',
        'top' : '0',
        'opacity' : '0.8',
        'display' : 'block',
        'width' : '100%',
        'height' : '100px',
        'background-color' : 'white',
        'z-index' : '1001',
        'overflow' : 'scroll'
      }));

      $buttonMax =
          $('<input>').attr({
            'class' : 'basbosa-logger-max-min',
            type : 'button',
            value : '+'
          }).css({
            'right' : '45px',
            'position' : 'fixed'
          }).click(function() {
            var height = $('.basbosa-logger').css('height') == '100px' ? '100%' : '100px'; 
            $('.basbosa-logger').css('height', height);
          });

      $buttonClose = $('<input>').attr({
        'claas' : 'basbosa-logger-close',
        type : 'button',
        value : 'x'
      }).css({
        'right' : '15px',
        'position' : 'fixed'
      }).click(function() {
        $('.basbosa-logger').hide();
      });

      $('.basbosa-logger').append($buttonMax, $buttonClose);
    });

    isFirstTime = false;
  };
  
  Logger.prototype.disableUiLogger = function() {
    if (typeof $ === 'undefined') return;
    $('.basbosa-logger').remove();
    this.setOptions({uiLogger : false});
  };

  /**
   * log method.
   * 
   * @api public
   */
  Logger.prototype.log = function(type) {
    var index, consoleArgs;

    for ( var i = 0; i < levels.length; i++) {
      if (levels[i] == type)
        index = i;
    }

    if (index > this.level || !this.enabled
        || typeof console == 'undefined'
        || typeof console.log == 'undefined')
      return this;


    var callingFile = this.getCallingFile();

    consoleArgs = this.getMyConsoleArgs(arguments, this, type, callingFile, index);
    console.log && console.log.apply && console.log.apply(console, consoleArgs);
    if (this.uiLogger) {
      this.uiLog(type, consoleArgs);
    }
    return this;
  };
  
  Logger.prototype.getCallingFile = function() {
    var callingFile = '', baseFolder = '', frames;
    try {
      throw (new Error());
    } catch (e) {
      if (e.stack) {
        frames = e.stack.split('\n');
        if (frames[0] == 'Error') frames.pop();
      
        callingFile = e.stack.split('\n')[3];
        
        // replace base path, on browser
        if (typeof window !== 'undefined') {
          baseFolder =  window.location.protocol + '//' + window.location.host;
        } 
      }
    }
    callingFile = callingFile.replace(baseFolder, '').replace(')', '');
    callingFile = callingFile.replace(')', '');
    callingFile = callingFile.split('/').splice(1).join('/');
    return '[' + callingFile + ']';
  };

  Logger.prototype.getLogTime = function() {
    var date = new Date()
    function checkTime(i) {
      return i < 10 ? '0' + i : i + '';
    }
    
    return checkTime(date.getHours()) + ':' + checkTime(date.getMinutes())
        + ':' + checkTime(date.getSeconds());
  };

  Logger.prototype.uiLog = function(type, outputConsoleArgs) {
    if (typeof $ === 'undefined') return;
    for (var i = 0; i < outputConsoleArgs.length; i++) {
      if (typeof outputConsoleArgs[i] === 'object') {
        outputConsoleArgs[i] = JSON.stringify(outputConsoleArgs[i]);
      }
    }
    $loggerRow =  $('<div>').addClass('basbosa-logger-' + type).html(
            outputConsoleArgs + '<hr/>');
    $('.basbosa-logger').append($loggerRow);
    $('.basbosa-logger').scrollTop(99999999999);

    /**
     * style the fonts each type with specific color
     */
    $('.basbosa-logger-debug').css({'color' : '#3333FF'});
    $('.basbosa-logger-trace').css({'color' : '#333366'});
    $('.basbosa-logger-error').css({'color' : 'red'});
    $('.basbosa-logger-warn').css({'color' : 'red'});
    $('.basbosa-logger-info').css({'color' : '#66CC00'});
  };

  Logger.prototype.getMyConsoleArgs = function(inputConsoleArgs, context, type, traceDetails, index) {
    var outputConsoleArgs = new Array();
    context.showTime ? outputConsoleArgs.push(context.getLogTime()) : '';
    outputConsoleArgs.push(context.colors ? '\033[' + colors[index] + 'm'
        + pad(type) + ' -\033[39m' : type + ':');
    //var inputs = toArray(inputConsoleArgs).slice(1);

    for ( var i = 1; i < inputConsoleArgs.length; ++i) {
      if (typeof inputConsoleArgs[i] === 'object' && this.stringifyObjects)
        outputConsoleArgs.push(JSON.stringify(inputConsoleArgs[i]));
      else
        outputConsoleArgs.push(inputConsoleArgs[i]);
    }
    context.showPath ? outputConsoleArgs.push(traceDetails) : '';
    return outputConsoleArgs;
  };

  /**
   * Generate methods for each log level.
   */

  for ( var i = 0; i < levels.length; i++) {
    var name = levels[i];
    (function(name) {
      Logger.prototype[name] = function() {
        this.log.apply(this, [ name ].concat(toArray(arguments)));
      };
    })(name);

  }

  if (typeof instance === 'undefined') instance = new Logger;
  if (typeof Basbosa !== 'undefined') Basbosa.add('Logger', instance);
  
  return instance;
}));