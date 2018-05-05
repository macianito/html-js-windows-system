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
      this.boxMem = null; // aux variable to remember dimension box/window values values

      this.idWindow = options.idWindow || '#window';



      var _id = this.idWindow.replace('#', ''); // set id

      _createWindow(_id); // create html window

      this.flags.modal = options.modal || false; // set if window is draggable

      if(this.flags.modal) { // if true then create overlay

      	_createOverlay(_id); // create html overlay

        window.windowSystem['overlay'].show();

      }

      this.documentObject = $(document);
      this.windowObject   = $(this.idWindow);

      this.barObject     = $(this.idWindow + ' .bar');
      this.contentObject = $(this.idWindow + ' .content');

      this.windowButtonsObject = $(this.idWindow + ' .window-buttons');

      // Setup jquery objects Window Buttons
      this.maximizeButton = $(this.idWindow + ' .maximize-button'),
      this.minimizeButton = $(this.idWindow + ' .minimize-button'),
      this.closeButton    = $(this.idWindow + ' .close-button'),

      this.barSize        = options.barSize || 27; // set bar size

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
     * Set the html content of the window.
     *
     * @public
     *
     * @param {string} html - content html.
     *
     */
    Window.prototype.setContentHtml = function(html) {
      this.contentObject.html(html);
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
      this.contentObject.html('<iframe src="' + url + '"></iframe>');
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

    };

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

            if(!self.flags.draggable) {
              return;
            }

            var coordsMouse = _getAbsoluteMousePosition(evt),
                newLeft =  self.memCoords.left + (coordsMouse.x - self.memCoords.x),
                newTop =  self.memCoords.top + (coordsMouse.y - self.memCoords.y),
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

          evt.preventDefault();

          _setFocus.call(self);

          evt.stopPropagation();

          self.flags.barMouseDown = true;
          _memCoordinates.call(self, evt);

        }),

        this.eventsHandlers.push({element: self.barObject[0], handlerFunction: handler, eventType: 'mousedown'}),

        Utils.attachEvent(self.documentObject[0], 'mouseup', handler = function(evt) {

          if(self.flags.barMouseDown) { // S'HA DE MIRAR NO SIGUI QUE SURT DELS LIMITS DEL DOC AMB MOUSEDOWN I NO FA RES
            _storeBox.call(self);
          }

          // reinit flags and variables
          self.flags.barMouseDown = false;
          self.flags.resizing = false;
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

          if(self.mouseZonePosition !== 'center') { // if resize zone

             _memCoordinates.call(self, evt);
             self.flags.resizing = true;

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

        // when you minimizes window
        // you have to store box in this way
        if(this.flags.minimized) {

          var boxMem      = Utils.getBoxElement(this.windowObject[0]);

          this.box = {
          	top    : boxMem.top,
            left   : boxMem.left,
            bottom : boxMem.top + this.box.height,
            right  : boxMem.left + this.box.width,
            width  : this.box.right - this.box.left,
            height : this.box.bottom - this.box.top
          };


        } else {

          this.box = Utils.getBoxElement(this.windowObject[0]);

        }

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

        var mouse = _getMousePosition(object, evt);


        if(mouse.x < this.box.left + 10) { // left

           if(mouse.y < this.box.top + 10) {
             this.mouseZonePosition = 'top-left';
           } else if(mouse.y > this.box.bottom - 10) {
             this.mouseZonePosition = 'bottom-left';
           } else {
             this.mouseZonePosition = 'left';
           }

        } else if(mouse.x > this.box.right - 10) { // right

           if(mouse.y < this.box.top + 10) {
             this.mouseZonePosition = 'top-right';
           } else if(mouse.y > this.box.bottom - 10) {
             this.mouseZonePosition = 'bottom-right';
           } else {
             this.mouseZonePosition = 'right';
           }

        } else if(mouse.y < this.box.top + 10) { // top
          this.mouseZonePosition = 'top';
        } else if(mouse.y > this.box.bottom - 10) { // bottom
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
