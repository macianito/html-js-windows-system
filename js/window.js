/**
 * @file wWndow manager
 * @see [Example]{@link http://example.com}
 * @author Mazius <ivanmaciagalan@gmail.com>
 * @version 0.1
 */


/** @global store window Objects */
window.windowSystem = {}; // mirar fer objecte {}

// object to store windows
window.windowSystem.windows = {};

/**
 * Close all windows
 *
 * @public
 *
 */
window.windowSystem.closeWindows = function() {
  for(var i in this.windows) {

    if(typeof(this.windows[i].close) != 'undefined')
      this.windows[i].close();

    if(typeof(this.windows[i]) != 'function')
      delete this.windows[i];

  }
};

/**
 * Get window by id.
 *
 * @public
 *
 * @param {string} id - window's id.
 * @returns {(object|boolean)} the window object
 *
 */
window.windowSystem.getWindowById = function(id) {

  var id = id.charAt(0) != '#' ? '#' + id : id;

  return typeof(this.windows[id]) != 'undefined' ? this.windows[id] : false;

};

/**
 * get all windows
 *
 * @public
 * @returns {array} array of window object
 *
 */
window.windowSystem.getWindows = function() {

  var windows = [];

  for(var id in this.windows) {

    if(typeof(this.windows[id]) != 'function' && id.charAt(0) == '#')
      windows.push(this.windows[id]);

  }

  return windows;

};

/**
 * get focused window
 *
 * @public
 * @returns {object} window object
 *
 */
window.windowSystem.getFocusedWindow = function() {

  var windows = this.getWindows();

  for(var i = 0; i < windows.length; i++) {

    if(windows[i].windowObject.hasClass('window-focused'))
      return windows[i];

  }

  return null;

};

/** @global object constructor function of windows */
this.Window = (function($) {
    'use strict';


    var boxCursors = {
      'left'         : 'w-resize',
      'top-left'     : 'nw-resize',
      'bottom-left'  : 'sw-resize',
      'right'        : 'e-resize',
      'top-right'    : 'ne-resize',
      'bottom-right' : 'se-resize',
      'top'          : 'n-resize',
      'bottom'       : 's-resize',
      'center'       : 'pointer'
    };



  /**
   * Create new instance of a Window.
   *
   * @class Represents a Window.
   *
   * @param {Object} options - Options to setup the window.
   *
   */

    function Window(options) {

        //options and helper vars

       // Flags
      this.flags = {
          barMouseDown : false,
          resizing     : false,
          maximized    : false,
          minimized    : false,
          draggable    : true,
          modal        : false
      };

      this.eventsHandlers = [];

      this.mouseZonePosition = null;
      this.memCoords         = null; // property to memorize coords

      this.box    = null;
      this.boxMem = null; // aux variable to remember dimension box/window values

      if(options.idWindow && options.idWindow.charAt(0) != '#') {
        options.idWindow = '#' + options.idWindow;
      }

      if(options.unique) { // if this window is the unique open window
        window.windowSystem.closeWindows();
      }



      this.idWindow = options.idWindow
        ? options.idWindow.charAt(0) != '#'
          ? '#' + options.idWindow : options.idWindow
        : '#window';


      this.id = this.idWindow.replace('#', ''); // set id - !!!!! must be unique

      _createWindow(this.id); // create html window

      this.flags.modal = options.modal || false; // set if window is draggable

      if(this.flags.modal) { // if true then create overlay

        _createOverlay(this.id); // create html overlay

        window.windowSystem['overlay'].show();

      }

      _createMovementOverlay(this.id);


      this.documentObject = $(document);
      this.windowObject   = $(this.idWindow);

      this.barObject     = $(this.idWindow + ' .bar');
      this.titleObject   = $(this.idWindow + ' .title');
      this.contentObject = $(this.idWindow + ' .content');

      this.windowButtonsObject = $(this.idWindow + ' .window-buttons');

      // Setup jquery objects Window Buttons
      this.maximizeButton = $(this.idWindow + ' .maximize-button'),
      this.minimizeButton = $(this.idWindow + ' .minimize-button'),
      this.closeButton    = $(this.idWindow + ' .close-button'),

      this.barSize        = options.barSize || 37; // set bar size

      this.winMinHeight   = options.minHeight || 70; // window minimal height
      this.winMinWidth    = options.minWidth  || 50; // window minimal width
      this.winMinSize     = false; // window minimal sixe

      this.contentObject.css('padding-top', (this.barSize + 5) + 'px'); // 5px to separate bar from content top


      this.minimizedWidth  = this.windowObject.width(); // set width when the window is minimized
      this.minimizedHeight = this.barSize; // set width when the window is minimized

      this.flags.draggable = (options.draggable === false) ? false : true; // set if window is draggable


      // if position is defined set the initial position
      if(options.position || false) {
        this.setPosition(options.position);
      }

      // if dimensions are defined set the initial position
      if(options.dimensions || false) {
        this.setDimensions(options.dimensions);
      }

      _storeBox.call(this);

      _setFocus.call(this); // set focus

      // start Window
      _initialize.call(this);

      window.windowSystem.windows[this.idWindow] = this; // storereference to window


      /* Events and custom functions
       ****************/
      if(options.close) {
        this.close = options.close; // set close custom function
      }

      this.onClose = options.onClose || function() {}; // set onClose event handler

    };

    /* Prototype functions
     ************************************/
    /**
     * Set the title content of the window.
     *
     * @public
     *
     * @param {string} html - content html.
     *
     */
    Window.prototype.setTitle = function(title, tooltip) {
      this.titleObject.html(title);

      if(tooltip)
        this.titleObject.attr('title', tooltip);

    };

    /**
     * Set the html content of the window.
     *
     * @public
     *
     * @param {string} html - content html.
     *
     */
    Window.prototype.setContentHtml = function(html) {
      this.contentObject.html(html);
      _createWindowUnfocusedOverlay.call(this);
    };

    /**
     * Set the content of the window as a iframe.
     *
     * @public
     *
     * @param {string} url - src of the iframe.
     *
     */
    Window.prototype.setContentIframe = function(url) {
      this.contentObject.html('<iframe id="iframe-' + this.id + '" class="iframe-content" src="' + url + '"></iframe>');
      _createWindowUnfocusedOverlay.call(this);
    };

    /**
     * Set the content using html from a dom element.
     *
     * @public
     *
     * @param {string} id - object's id where the html content come from.
     *
     */
    Window.prototype.setContentFromObject = function(id) {
      this.contentObject.html($(id).html());
      _createWindowUnfocusedOverlay.call(this);
    };


    /**
     * Set if window is draggable.
     *
     * @public
     *
     * @param {boolean} draggable - Set if the window is draggable
     *
     */
    Window.prototype.setDraggable = function(draggable) {
      this.flags.draggable = draggable;
    };

    /**
     * Close and destroy window.
     *
     * @public
     *
     */
    Window.prototype.close = function() {

      this.onClose();

      if(this.flags.modal) {
        window.windowSystem['overlay'].hide();
      }

      _destroy.call(this);

      // set focus to other window
      var windowsIds = Object.keys(window.windowSystem.windows);
      if(windowsIds.length > 0)
        window.windowSystem.windows[windowsIds[windowsIds.length - 1]].setFocus();

    };

    /**
    * Set the focus to the window.
    *
    * @public
    *
    */
    Window.prototype.setFocus = function () {

      _setFocus.call(this);

    }

    /**
     * Hide the window
     *
     * @public
     *
     */
    Window.prototype.hide = function() {
      this.windowObject.hide();
    };

    /**
     * Show the window.
     *
     * @public
     *
     */
    Window.prototype.show = function() {
      this.windowObject.show();
    };

   /**
    * Set the position of the window.
    *
    * @public
    *
    * @param {Object} position - coords of the window
    *
    */
    Window.prototype.setPosition = function(position) {

      this.windowObject.css({
        top: position.top + 'px',
        left: position.left + 'px'
      });

      _storeBox.call(this);

   };

   /**
    * Set the dimensions of the window.
    *
    * @public
    *
    * @param {Object} position - dimensions: width and height
    *
    */
    Window.prototype.setDimensions = function(dimensions) {

      this.windowObject.css({
        width  : dimensions.width + 'px',
        height : dimensions.height + 'px'
      });

      _storeBox.call(this);

    };

    /**
     * Maximize window.
     *
     * @public
     *
     */
    Window.prototype.maximize = function() {

      _maximizeWindow.call(this);

    };

    /**
     * Minimize window.
     *
     * @public
     *
     */
    Window.prototype.minimize = function() {

      _minimizeWindow.call(this);

    };


    return Window; // return class after create prototype functions

    /* Private helper functions
     ************************************/


   /**
    * Initialize window events and store references to hadlers.
    *
    * @private
    *
    *
    */

    function _initialize() {

        var self = this,
            handler = null;

        Utils.attachEvent(self.documentObject[0], 'mousemove', handler = function(evt) {

          if(self.flags.barMouseDown) {

            if(!self.flags.draggable || self.flags.maximized) {
              return;
            }

            var coordsMouse  = _getAbsoluteMousePosition(evt),
                newLeft      =  self.memCoords.left + (coordsMouse.x - self.memCoords.x),
                newTop       =  self.memCoords.top + (coordsMouse.y - self.memCoords.y),
                windowHeight = $(window).height();


            if(newTop <= 0) {

              newTop = 0;

            } else if(newTop > windowHeight - self.barSize) {

              newTop = windowHeight - self.barSize;

            }

            self.windowObject.css({top: newTop, left: newLeft});

          } else if(self.flags.resizing) {

             var coordsMouse = _getAbsoluteMousePosition(evt);

             var vectorResize = {
                x: coordsMouse.x - self.memCoords.x,
                y: coordsMouse.y - self.memCoords.y
             };

             _resizeWindow.call(self, self.mouseZonePosition, vectorResize);

          }

        }),


        this.eventsHandlers.push({element: self.documentObject[0], handlerFunction: handler, eventType: 'mousemove'}),

        Utils.attachEvent(self.windowButtonsObject[0], 'mousedown', handler = function(evt) {

          evt.stopPropagation(); // Avoid propagation

        }),

        this.eventsHandlers.push({element: self.windowButtonsObject[0], handlerFunction: handler, eventType: 'mousedown'}),

        Utils.attachEvent(self.barObject[0], 'mousedown', handler = function(evt) {

          if(self.mouseZonePosition !== 'center')
            return true;

          evt.preventDefault();

          _setFocus.call(self);

          evt.stopPropagation();

          self.flags.barMouseDown = true;
          self.windowObject.addClass('content-blocked');
          window.windowSystem['movement-overlay'].show();

          _memCoordinates.call(self, evt);

        }),

        this.eventsHandlers.push({element: self.barObject[0], handlerFunction: handler, eventType: 'mousedown'}),

        Utils.attachEvent(self.barObject[0], 'dblclick', handler = function(evt) {


          evt.preventDefault();
          evt.stopPropagation();

          _setFocus.call(self);

          self.maximizeButton.trigger('click');

        }),

        this.eventsHandlers.push({element: self.barObject[0], handlerFunction: handler, eventType: 'dblclick'}),

        Utils.attachEvent(self.documentObject[0], 'mouseup', handler = function(evt) {

          if(self.flags.barMouseDown) { // S'HA DE MIRAR NO SIGUI QUE SURT DELS LIMITS DEL DOC AMB MOUSEDOWN I NO FA RES


            // stores current dimensions when ends action over window
            if(self.flags.minimized)
             _storeMinimizedBox.call(self);
            else if(!self.flags.maximized) // except when window is maximized
             _storeBox.call(self);

          }

          // reinit flags and variables
          self.flags.barMouseDown = false;

          self.flags.resizing = false;
          self.windowObject.removeClass('content-blocked'); // when action over window
          window.windowSystem['movement-overlay'].hide();

          self.memCoords = null;
          self.boxMem = null;

        }),

        this.eventsHandlers.push({element: self.documentObject[0], handlerFunction: handler, eventType: 'mouseup'}),

        Utils.attachEvent(self.windowObject[0], 'mousemove', handler = function(evt) {

          if(!self.flags.resizing) { // XXX
            _setMouseZonePosition.call(self, this, evt);
            _changeCursor.call(self);
          }

        }),

        this.eventsHandlers.push({element: self.windowObject[0], handlerFunction: handler, eventType: 'mousemove'}),

        Utils.attachEvent(self.windowObject[0], 'mousedown', handler = function(evt) {


          _setFocus.call(self); //  set focus to this window

          if(self.mouseZonePosition !== 'center' && !self.flags.maximized) { // if resize zone and not maximized

             _memCoordinates.call(self, evt);
             self.flags.resizing = true;
             self.windowObject.addClass('content-blocked'); // when resizing start
             window.windowSystem['movement-overlay'].show();


             self.boxMem = Utils.cloneObject(self.box);
          }

        }),

        this.eventsHandlers.push({element: self.windowObject[0], handlerFunction: handler, eventType: 'mousedown'}),

        Utils.attachEvent(self.minimizeButton[0], 'click', handler = function(evt) {

            evt.stopPropagation();

            if(self.flags.minimized) //  Don't do anything if it is minimized
              return false;

           if(!self.flags.maximized)
             _storeBox.call(self);

            _minimizeWindow.call(self);

            self.maximizeButton.removeClass('maximize-button restore-button');


            if(self.flags.maximized) {

              self.maximizeButton.addClass('maximize-button');

            } else {

              self.maximizeButton.addClass('restore-button');

            }

             self.flags.minimized = true;

        }),

        this.eventsHandlers.push({element: self.minimizeButton[0], handlerFunction: handler, eventType: 'click'}),

        Utils.attachEvent(self.maximizeButton[0], 'click', handler = function(evt) {

           evt.stopPropagation();

           self.maximizeButton.removeClass('maximize-button restore-button');

           if(self.flags.minimized && !self.flags.maximized) { // state: minimized from a normal window

             self.maximizeButton.addClass('maximize-button');

             _restoreWindow.call(self);

           } else if(self.flags.minimized && self.flags.maximized) { // state: minimized from a maximized window

             self.maximizeButton.addClass('restore-button');

             _maximizeWindow.call(self);

           } else if(self.flags.maximized) { // normal window from maximized window

             self.maximizeButton.addClass('maximize-button');

             self.flags.maximized = false;

             _restoreWindow.call(self);

           } else { // normal window to maximize

             self.maximizeButton.addClass('restore-button');

             self.flags.maximized = true;

             _maximizeWindow.call(self);

           }

           self.flags.minimized = false;

        }),

        this.eventsHandlers.push({element: self.maximizeButton[0], handlerFunction: handler, eventType: 'click'}),

        Utils.attachEvent(this.closeButton[0], 'click', handler = function(evt) {

           self.close();

        }),

        this.eventsHandlers.push({element: this.closeButton[0], handlerFunction: handler, eventType: 'click'});

    }

    /**
     * Destroy window and detach event handlers.
     *
     * @private
     * @see {@link https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/}
     *
     */
     function _destroy() {
       // we must free references
       // 1       detach events
       //         remove objects

       for(var i = 0; i < this.eventsHandlers.length; i++) { // avoiding cyclic references

         var element = Utils.isjQueryObject(this.eventsHandlers[i].element)
           ? this.eventsHandlers[i].element[0]
           : this.eventsHandlers[i].element;

         Utils.detachEvent(element, this.eventsHandlers[i].eventType, this.eventsHandlers[i].handlerFunction);

         this.eventsHandlers[i].element = null;
         this.eventsHandlers[i].handlerFunction = null;

         delete this.eventsHandlers[i];

       }

       //this.eventsHandlers.splice(0, this.eventsHandlers.length);
       //this.eventsHandlers = null;

       this.contentObject.remove();
       this.contentObject = null;

       // Remove elements
       this.maximizeButton.remove();
       this.maximizeButton = null;

       this.minimizeButton.remove();
       this.minimizeButton = null;

       this.closeButton.remove();
       this.closeButton = null;

       this.windowButtonsObject.remove();
       this.windowButtonsObject = null;

       this.barObject.remove();
       this.barObject = null;

       this.windowObject.remove();
       this.windowObject = null;

       window.windowSystem.windows[this.idWindow] = null;
       delete window.windowSystem.windows[this.idWindow];

    };


   /**
    * Set the focus to the window.
    *
    * @private
    *
    */
    function _setFocus() {

      $('.window').removeClass('window-focused');
      this.windowObject.addClass('window-focused');

    }


    /**
    * Store the dimensions of the window
    *
    * @private
    *
    */
    function _storeBox() {

       this.box = Utils.getBoxElement(this.windowObject[0]);

     }

   /**
    * Store the minimized box
    *
    * @private
    *
    */
    function _storeMinimizedBox() {

       var box = Utils.getBoxElement(this.windowObject[0]);

       this.box.top    = box.top;
       this.box.left   = box.left;
       this.box.bottom = box.top  + this.box.height;
       this.box.right  = box.left + this.box.width;

     }


    /**
     * Minimize the window
     *
     * @private
     *
     */
     function _minimizeWindow() {

       this.windowObject.css({
         top    : this.box.top + 'px',
         left   : this.box.left + 'px',
         width  : this.minimizedWidth + 'px', // this.box.width
         height : this.minimizedHeight + 'px'
       });
     }


    /**
     * Maximize the window
     *
     * @private
     *
     */
     function _maximizeWindow() {

       this.windowObject.css({
         top    : '0px',
         left   : '0px',
         width  : $(window).width(),
         height : $(window).width()
       });

     }

    /**
     * Retore the window to its normal size
     *
     * @private
     *
     */
     function _restoreWindow() {

       _setCssDimensionsElement(this.windowObject, this.box);

     }


    /**
     * Resize the window
     *
     * @private
     *
     */
     function _resizeWindow(mouseZonePosition, vectorResize) {

        /* if((this.box.top + this.winMinHeight) > (this.box.bottom) && vectorResize.y <= 0) { // set minimal height
          return;
        }

        if((this.box.right - this.winMinWidth) < (this.box.left) && vectorResize.x <= 0) { // set minimal width
          return;
        } */

        if(!this.winMinSize) {
          if((this.box.top + this.box.bootom < this.winMinHeight) ||
             (this.box.right - this.box.left < this.winMinWidth)
           ) { // set minimal size
            this.winMinSize = true;
            return;
          }
        } else {

          if((mouseZonePosition == 'left' && vectorResize.x > 0)  ||
             (mouseZonePosition == 'right' && vectorResize.x < 0) ||
             (mouseZonePosition == 'top' && vectorResize.y < 0)   ||
             (mouseZonePosition == 'bottom' && vectorResize.y > 0)
          ) {
            return;
          } else {
            this.winMinSize = false;
          }


        }

        switch(mouseZonePosition) {
          case 'left':
            this.box.left = this.boxMem.left + vectorResize.x;
          break;
          case 'top-left':
            this.box.left = this.boxMem.left + vectorResize.x;
            this.box.top = this.boxMem.top + vectorResize.y;
          break;
          case 'bottom-left':
            this.box.left = this.boxMem.left + vectorResize.x;
            this.box.bottom = this.boxMem.bottom + vectorResize.y;
          break;
          case 'right':
            this.box.right = this.boxMem.right + vectorResize.x;
          break;
          case 'top-right':
            this.box.right = this.boxMem.right + vectorResize.x;
            this.box.top = this.boxMem.top + vectorResize.y;
          break;
          case 'bottom-right':
            this.box.right = this.boxMem.right + vectorResize.x;
            this.box.bottom = this.boxMem.bottom + vectorResize.y;
          break;
          case 'top':
            this.box.top = this.boxMem.top + vectorResize.y;
          break;
          case 'bottom':
            this.box.bottom = this.boxMem.bottom + vectorResize.y;
          break;
        }




        _setCssDimensionsElement(this.windowObject, this.box);


     }

    /**
     * Memorize coordinates of the window
     *
     * @private
     *
     */
     function _memCoordinates(evt) {

       this.memCoords = _getAbsoluteMousePosition(evt);

       var windowPosition = this.windowObject.position();

       this.memCoords.top = windowPosition.top,
       this.memCoords.left = windowPosition.left;

     }

    /**
     * Store the position of the mouse regarding the window frame
     *
     * @private
     *
     */
     function _setMouseZonePosition(object, evt) {

        var mouse = _getAbsoluteMousePosition(evt);

        if(this.flags.maximized)
          return this.mouseZonePosition = 'center';


        if(mouse.x < this.box.left + 7) { // left

           if(mouse.y < this.box.top + (this.barSize / 7)) {
             this.mouseZonePosition = 'top-left';
           } else if(mouse.y > this.box.bottom - this.barSize) {
             this.mouseZonePosition = 'bottom-left';
           } else {
             this.mouseZonePosition = 'left';
           }

        } else if(mouse.x > this.box.right - 7) { // right

           if(mouse.y < this.box.top + (this.barSize / 7)) {
             this.mouseZonePosition = 'top-right';
           } else if(mouse.y > this.box.bottom - this.barSize) {
             this.mouseZonePosition = 'bottom-right';
           } else {
             this.mouseZonePosition = 'right';
           }

        } else if(mouse.y < this.box.top + (this.barSize / 7)) { // top
          this.mouseZonePosition = 'top';
        } else if(mouse.y > this.box.bottom - this.barSize) { // bottom
          this.mouseZonePosition = 'bottom';
        } else {
          this.mouseZonePosition = 'center';
        }

        return this.mouseZonePosition;

        //console.log(this.mouseZonePosition, mouse.y, this.box.bottom - this.barSize);

     }


    /**
     * Change the cursor according to cursor position
     *
     * @private
     *
     */
     function _changeCursor() {
       this.windowObject.css('cursor', boxCursors[this.mouseZonePosition]);
     }

    /**
     * Create html window
     *
     * @private
     *
     * @param {string} id - Id of the window.
     *
     */
   function _createWindow(id) {

     $('<div id="' + id + '" class="window">' +
       '  <div class="bar">' +
       '    <span class="title">title</span>' +
       '    <div class="window-buttons">' +
       '      <span class="window-button minimize-button"></span>' +
       '      <span class="window-button maximize-button"></span>' +
       '      <span class="window-button close-button"></span>' +
       '    </div>' +
       '  </div>' +
       '  <div class="content"></div>' +
       '</div>').appendTo('body');

   }

    /**
     * Create html overlay
     *
     * @private
     *
     * @param {string} id - Id of the overlay.
     *
     */
     function _createOverlay(id) {

       if($('.window-overlay').size() === 0) {

         window.windowSystem['overlay'] = $('<div id="' + id + '-overlay" class="window-overlay"></div>');

         window.windowSystem['overlay'].appendTo('body');

       }

     }

    /**
     * Create html movement overlay to avoid problems with some elements while dragging
     *
     * @private
     *
     * @param {string} id - Id of the movement overlay.
     *
     */
     function _createMovementOverlay(id) {

       if($('.window-movement-overlay').length === 0) {

         window.windowSystem['movement-overlay'] = $('<div id="' + id + '-movement-overlay" class="window-movement-overlay"></div>');

         window.windowSystem['movement-overlay'].appendTo('body');

       }

     }

    /**
     * Create window unfocused overlay
     *
     * @private
     *
     *
     */
     function _createWindowUnfocusedOverlay() {
       this.contentObject.append(_createElement({_class : 'window-unfocused-overlay'}));
     };

    /**
     * Create div object
     *
     * @private
     *
     * @param {string} id - Id of the movement overlay.
     *
     */
     function _createElement(params) {

       var node = document.createElement((typeof params.type !== 'undefined') ? params.type : "DIV");

       node.id = (typeof params.id !== 'undefined') ? params.id : '';

       node.className = (typeof params._class !== 'undefined') ? params._class : '';

       node.innerHTML = (typeof params.html !== 'undefined') ? params.html : '';

       return node;

     }



    /**
     * Set the dimensions of a dom object
     *
     * @private
     *
     * @param {object|jQuery object} element - The dom element that you apply the dimensions to.
     * @param {object} box - Dimensions to apply.
     *
     */
     function _setCssDimensionsElement(element, box) {

       Utils.getjQueryObject(element).css({
         top    : box.top + 'px',
         left   : box.left + 'px',
         width  : (box.right - box.left) + 'px',
         height : (box.bottom - box.top) + 'px'
       });

     }

     /**
     * Get the position of the mouse relative to its parent
     *
     * @private
     *
     * @param {object} object - object
     * @param {object} evt - Event object.
     *
     */
     function _getMousePosition(object, evt) {
       return Utils.getMousePosition(object, evt);;
     }

    /**
     * Get the absolute position of the mouse
     *
     * @private
     *
     * @param {object} evt - Event object.
     *
     */
     function _getAbsoluteMousePosition(evt) {
       return Utils.getAbsoluteMousePosition(evt);
     }

})(jQuery);
