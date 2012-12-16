basbosa-logger
==============

Features
----------

1. Can be loaded as an AMD module (e.g. requirejs), Common JS module (e.g. nodejs) or standalone
2. Show line number on which the logging function was called
3. logs objects as json strings
4.  UI logger extremely useful on mobile devices
5. Easy control debug level to control the verbosity of you application and hunt errors

Options
-------
```javascript
  /**
   * 
   * colors (boolean, default true) - specifies whether to use colors for log
   * levels or not enabled (boolean, default tue) - specifies whether the logger
   * is enabled to output messages or not showTime (boolean, default true) -
   * specifies whether a time stamp should be output with log messages or not
   * showPath (boolean, default true) - specifies whether a path to the file
   * logging the message shoud be output with it level (int, default 3) -
   * specifies the highest log level to be output (***indexing is zero-based***)
   * poorLogger (boolean, default false) - On browsers without a console object
   * uiLogger (boolean, true) - Enable or disable on screen custom logger, usefull on mobile and tablets requires jquery
   * 
   */
  var defaultOptions = {
    colors : SERVER ? true : false,
    enabled : true,
    showTime : true,
    showPath : true,
    level : 2,
    poorLogger : false,
    uiLogger : true
  };
```
