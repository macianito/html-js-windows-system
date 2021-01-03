/**
 * @file wWndow manager
 * @see [Example]{@link http://example.com}
 * @author Mazius <ivanmaciagalan@gmail.com>
 * @version 0.1
 */


/** @global store window Objects */
window.windowSystem = {}; // mirar fer objecte {}

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

      this.idWindow = options.idWindow
        ? options.idWindow.charAt(0) != '#'
          ? '#' + options.idWindow : options.idWindow
        : '#window';


      this.id = this.idWindow.replace('#', ''); // set id - !!!!! must be unique

      _createWindow(this.id); // create html window

      this.flags.modal = options.modal || false; // set if window is draggable

      if(this.flags.modal) { // if true then create overlay

        _createOverlay(this.id); // create html overlay

        window.windowSystem['overlay'].style.display = 'block';

      }

      _createMovementOverlay(this.id);


      this.documentObject = document;
      this.windowObject   = document.getElementById(this.id);

      this.barObject = document.querySelectorAll(this.idWindow + ' .bar')[0];


      this.titleObject   = document.querySelectorAll(this.idWindow + ' .title')[0];
      this.contentObject = document.querySelectorAll(this.idWindow + ' .content')[0];

      this.windowButtonsObject = document.querySelectorAll(this.idWindow + ' .window-buttons')[0];

      // Setup jquery objects Window Buttons
      this.maximizeButton = document.querySelectorAll(this.idWindow + ' .maximize-button')[0],


      this.minimizeButton = document.querySelectorAll(this.idWindow + ' .minimize-button')[0],
      this.closeButton    = document.querySelectorAll(this.idWindow + ' .close-button')[0],

      this.barSize        = options.barSize || 27; // set bar size
	  
	  this.winMinHeight   = options.minHeight || 70; // window minimal height 

      this.contentObject.style.paddingTop =  (this.barSize + 5) + 'px'; // 5px to separate bar from content top


      this.minimizedWidth  = Utils.getBoxElement(this.windowObject).width; // set width when the window is minimized
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

      window.windowSystem[this.idWindow] = this; // storereference to window


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
    Window.prototype.setTitle = function(title) {
      this.titleObject.innerHTML = title;
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
      this.contentObject.innerHTML = html;
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
      this.contentObject.innerHTML = '<iframe id="iframe-' + this.id + '" class="iframe-content" src="' + url + '"></iframe>';
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
      this.contentObject.innerHTML = document.getElementById(id.replace('#', '')).innerHTML;
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
        window.windowSystem['overlay'].style.display = 'none';
      }

      _destroy.call(this);

    };

    /**
     * Hide the window
     *
     * @public
     *
     */
    Window.prototype.hide = function() {
      this.windowObject.style.display = 'none';
    };

    /**
     * Show the window.
     *
     * @public
     *
     */
    Window.prototype.show = function() {
      this.windowObject.style.display = 'block';
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

      this.windowObject.style.top  = position.top + 'px';
      this.windowObject.style.left = position.left + 'px';

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

      this.windowObject.style.width  = dimensions.width + 'px';
      this.windowObject.style.height = dimensions.height + 'px';

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

        Utils.attachEvent(self.documentObject, 'mousemove', handler = function(evt) {

          if(self.flags.barMouseDown) {

            if(!self.flags.draggable) {
              return;
            }

            var coordsMouse  = _getAbsoluteMousePosition(evt),
                newLeft      = self.memCoords.left + (coordsMouse.x - self.memCoords.x),
                newTop       = self.memCoords.top + (coordsMouse.y - self.memCoords.y),
                windowHeight = window.innerHeight;


            if(newTop <= 0) {

              newTop = 0;

            } else if(newTop > windowHeight - self.barSize) {

              newTop = windowHeight - self.barSize;

            }

            self.windowObject.style.top  =  newTop + 'px';
            self.windowObject.style.left =  newLeft + 'px';

          } else if(self.flags.resizing) {

             var coordsMouse = _getAbsoluteMousePosition(evt);

             var vectorResize = {
                x: coordsMouse.x - self.memCoords.x,
                y: coordsMouse.y - self.memCoords.y
             };

             _resizeWindow.call(self, self.mouseZonePosition, vectorResize);

          }

        }),


        this.eventsHandlers.push({element: self.documentObject, handlerFunction: handler, eventType: 'mousemove'}),

        Utils.attachEvent(self.windowButtonsObject, 'mousedown', handler = function(evt) {

          evt.stopPropagation(); // Avoid propagation

        }),

        this.eventsHandlers.push({element: self.windowButtonsObject, handlerFunction: handler, eventType: 'mousedown'}),

        Utils.attachEvent(self.barObject, 'mousedown', handler = function(evt) {


          evt.preventDefault();

          _setFocus.call(self);

          evt.stopPropagation();

          self.flags.barMouseDown = true;
          self.windowObject.classList.add('content-blocked');
          window.windowSystem['movement-overlay'].style.display = 'block';

          _memCoordinates.call(self, evt);

        }),

        this.eventsHandlers.push({element: self.barObject, handlerFunction: handler, eventType: 'mousedown'}),

        Utils.attachEvent(self.documentObject, 'mouseup', handler = function(evt) {

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
          self.windowObject.classList.remove('content-blocked'); // when action over window
          window.windowSystem['movement-overlay'].style.display = 'none';

          self.memCoords = null;
          self.boxMem = null;

        }),

        this.eventsHandlers.push({element: self.documentObject, handlerFunction: handler, eventType: 'mouseup'}),

        Utils.attachEvent(self.windowObject, 'mousemove', handler = function(evt) {

          if(!self.flags.resizing) { // XXX
            _setMouseZonePosition.call(self, this, evt);
            _changeCursor.call(self, boxCursors[self.mouseZonePosition]);
          }

        }),

        this.eventsHandlers.push({element: self.windowObject, handlerFunction: handler, eventType: 'mousemove'}),

        Utils.attachEvent(self.windowObject, 'mousedown', handler = function(evt) {


          _setFocus.call(self); //  set focus to this window

          if(self.mouseZonePosition !== 'center') { // if resize zone

             _memCoordinates.call(self, evt);
             self.flags.resizing = true;
             self.windowObject.classList.add('content-blocked'); // when resizing start
             window.windowSystem['movement-overlay'].style.display = 'block';


             self.boxMem = Utils.cloneObject(self.box);
          }

        }),

        this.eventsHandlers.push({element: self.windowObject, handlerFunction: handler, eventType: 'mousedown'}),

        Utils.attachEvent(self.minimizeButton, 'click', handler = function(evt) {

            evt.stopPropagation();

            if(self.flags.minimized) //  Don't do anything if it is minimized
              return false;

           if(!self.flags.maximized)
             _storeBox.call(self);

             _minimizeWindow.call(self);

             self.maximizeButton.classList.remove("maximize-button");
             self.maximizeButton.classList.remove("restore-button");


           if(self.flags.maximized) {

             self.maximizeButton.classList.add("maximize-button");

           } else {

             self.maximizeButton.classList.add("restore-button");

           }

           self.flags.minimized = true;

        }),

        this.eventsHandlers.push({element: self.minimizeButton, handlerFunction: handler, eventType: 'click'}),

        Utils.attachEvent(self.maximizeButton, 'click', handler = function(evt) {

           evt.stopPropagation();

           self.maximizeButton.classList.remove("maximize-button");
           self.maximizeButton.classList.remove("restore-button");

           if(self.flags.minimized && !self.flags.maximized) { // state: minimized from a normal window

             self.maximizeButton.classList.add("maximize-button");

             _restoreWindow.call(self);

           } else if(self.flags.minimized && self.flags.maximized) { // state: minimized from a maximized window

             self.maximizeButton.classList.add("restore-button");

             _maximizeWindow.call(self);

           } else if(self.flags.maximized) { // normal window from maximized window

             self.maximizeButton.classList.add("maximize-button");

             self.flags.maximized = false;

             _restoreWindow.call(self);

           } else { // normal window to maximize

             self.maximizeButton.classList.add("restore-button");

             self.flags.maximized = true;

             _maximizeWindow.call(self);

           }

           self.flags.minimized = false;

        }),

        this.eventsHandlers.push({element: self.maximizeButton, handlerFunction: handler, eventType: 'click'}),

        Utils.attachEvent(this.closeButton, 'click', handler = function(evt) {

           self.close();

        }),

        this.eventsHandlers.push({element: this.closeButton, handlerFunction: handler, eventType: 'click'});

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

       window.windowSystem[this.idWindow] = null;
       delete window.windowSystem[this.idWindow];

    };


   /**
    * Set the focus to the window.
    *
    * @private
    *
    */
    function _setFocus() {

      var ws = document.querySelectorAll('.window');
      for(var i = 0; i < ws.length; i++) {
        ws[i].classList.remove('window-focused');
      }

      this.windowObject.classList.add('window-focused');

    }


    /**
    * Store the dimensions of the window
    *
    * @private
    *
    */
    function _storeBox() {

       this.box = Utils.getBoxElement(this.windowObject);

     }

   /**
    * Store the minimized box
    *
    * @private
    *
    */
    function _storeMinimizedBox() {

       var box = Utils.getBoxElement(this.windowObject);

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

       this.windowObject.style.top    = this.box.top + 'px';
       this.windowObject.style.left   = this.box.left + 'px';
       this.windowObject.style.width  = this.minimizedWidth + 'px';
       this.windowObject.style.height = this.minimizedHeight + 'px';
     }


    /**
     * Maximize the window
     *
     * @private
     *
     */
     function _maximizeWindow() {

       this.windowObject.style.top    = 0;
       this.windowObject.style.left   = 0;
       this.windowObject.style.width  = '100%';
       this.windowObject.style.height = window.innerHeight + 'px';

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
		 
		if((this.box.top + this.winMinHeight) > (this.box.bottom) && vectorResize.y <= 0) { // set minimal height
		  return;
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

       var windowPosition = Utils.getBoxElement(this.windowObject);

       this.memCoords.top  = windowPosition.top,
       this.memCoords.left = windowPosition.left;

     }

    /**
     * Store the position of the mouse regarding the window frame
     *
     * @private
     *
     */
     function _setMouseZonePosition(object, evt) {

        var mouse = _getMousePosition(object, evt);


        if(mouse.x < this.box.left + this.barSize) { // left

           if(mouse.y < this.box.top + this.barSize) {
             this.mouseZonePosition = 'top-left';
           } else if(mouse.y > this.box.bottom - this.barSize) {
             this.mouseZonePosition = 'bottom-left';
           } else {
             this.mouseZonePosition = 'left';
           }

        } else if(mouse.x > this.box.right - this.barSize) { // right

           if(mouse.y < this.box.top + this.barSize) {
             this.mouseZonePosition = 'top-right';
           } else if(mouse.y > this.box.bottom - this.barSize) {
             this.mouseZonePosition = 'bottom-right';
           } else {
             this.mouseZonePosition = 'right';
           }

        } else if(mouse.y < this.box.top + this.barSize) { // top
          this.mouseZonePosition = 'top';
        } else if(mouse.y > this.box.bottom - this.barSize) { // bottom
          this.mouseZonePosition = 'bottom';
        } else {
          this.mouseZonePosition = 'center';
        }

     }


    /**
     * Change the cursor according to cursor position
     *
     * @private
     *
     */
     function _changeCursor(cursor) {
       this.windowObject.style.cursor = cursor;
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

    var wstr = '<div class="bar">' +
               '  <span class="title">title</span>' +
               '  <div class="window-buttons">' +
               '    <span class="window-button minimize-button"></span>' +
               '    <span class="window-button maximize-button"></span>' +
               '    <span class="window-button close-button"></span>' +
               '  </div>' +
               '</div>' +
               '<div class="content"></div>';

    var node = document.createElement("DIV");

    node.id = id;

    node.className = 'window';

    node.innerHTML = wstr;

    document.querySelectorAll("body")[0].appendChild(node);



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

       if(document.querySelectorAll(".window-overlay").length === 0) {

         //window.windowSystem['overlay'] = $('<div id="' + id + '-overlay" class="window-overlay"></div>');

         window.windowSystem['overlay'] = _createElement({id : id, _class : 'window-overlay'});

         document.querySelectorAll("body")[0].appendChild(window.windowSystem['overlay']);

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

       if(document.querySelectorAll(".window-movement-overlay").length === 0) {

         //window.windowSystem['movement-overlay'] = $('<div id="' + id + '-movement-overlay" class="window-movement-overlay"></div>');

         window.windowSystem['movement-overlay'] = _createElement({id : id, _class : 'window-movement-overlay'});

         document.querySelectorAll("body")[0].appendChild(window.windowSystem['movement-overlay']);

       }

     }

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

          element.style.top    = box.top + 'px';
          element.style.left   = box.left + 'px';
          element.style.width  = (box.right - box.left) + 'px';
          element.style.height = (box.bottom - box.top) + 'px';

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
