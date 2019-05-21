    ///////////// FUNCIO MEVA BONA /////////////

Utils = {
  attachEvent: function(ele, type, fn) { // bindEvent
    if(ele.attachEvent) {
      ele.attachEvent && ele.attachEvent('on' + type, fn);
    } else {
      ele.addEventListener(type, fn, false);
    }
  },
  detachEvent: function(ele, type, fn) { // unbindEvent
    if(ele.detachEvent) {
       ele.detachEvent && ele.detachEvent('on' + type, fn);
    } else {
       ele.removeEventListener(type, fn, false);
    }
  },
  getElementById: function(id) { // unbindEvent
    return document.getElementById(id);
  },
  querySelectorAll: function(selector) { // unbindEvent
    return document.querySelectorAll(selector);
  },
  querySelector: function(selector) { // unbindEvent
    return document.querySelector(selector);
  },
  each: function (object, fn) {
    if(object && fn) {
      var l = object.length;
      for (var i = 0; i < l && fn(object[i], i) !== false; i++) {}
    }
  },
  getAbsoluteMousePosition: function(evt) {
     return { x: evt.pageX, y: evt.pageY };
  },
  getMousePosition: function(object, evt) { // position relative to its parent
       var parentOffset = $(object).parent().offset();
       return {
         x: evt.pageX - parentOffset.left,
         y: evt.pageY - parentOffset.top
       };
  },
  /* getBoxElement: function(element) {

      var boxElement = element.getBoundingClientRect();

      return {
        left: boxElement.left,
        top: boxElement.top,
        right: boxElement.right,
        bottom: boxElement.bottom,
        width: boxElement.right - boxElement.left,
        height: boxElement.bottom - boxElement.top
      };
   }, */
   getAbsolutePositionElement: function(el) {
    var box = el.getBoundingClientRect(),

        body = document.body,
        docEl = document.documentElement,

        scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop,
        scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft,

        clientTop = docEl.clientTop || body.clientTop || 0,
        clientLeft = docEl.clientLeft || body.clientLeft || 0,

        top  = box.top +  scrollTop - clientTop,
        left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
  },
 /**
  * Get the dimensions of a dom object
  * 
  * @private
  * 
  * @param {object|jQuery object} element - Dom object to get the domensions from.
  *
  */
  getBoxElement: function(element) {

      var boxElement = element.getBoundingClientRect(),
          positionElement = this.getAbsolutePositionElement(element);

      return {
        left: positionElement.left,
        top: positionElement.top,
        right: boxElement.right,
        bottom: boxElement.bottom,
        width: boxElement.right - boxElement.left,
        height: boxElement.bottom - boxElement.top
      };
   },
   isjQueryObject: function(element) {
     return (element instanceof $ || element instanceof jQuery);
   },
   getjQueryObject: function(element) {
     return (this.isjQueryObject(element)) ? element : jQuery(element);
   },
   timeToHMS: function (tm) {
     var dt = new Date(tm);
     return dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
   },
   cloneObject: function (object) {
      return jQuery.extend(true, {}, object); // Deep copy
   }


};

// difine alias
Utils.bindEvent = Utils.attachEvent;
Utils.unbindEvent = Utils.detachEvent;

console.log(Utils)