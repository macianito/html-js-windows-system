# HTML/JS windows system

A window manager written in Javascript, HTML5 and CSS3.

This project started as an entertainment, feel free to download and use or fork!

## Authors

* **Ivan Macià** - *Initial work* - [http://mazius.org](http://mazius.org)

### Live Example ###

[http://phplandia.com/examples/Window/window.html](http://phplandia.com/examples/Window/window.html)

## installation

    <script type="text/javascript" src="js/jquery-2.2.0.min.js"></script>
    <script type="text/javascript" src="js/utils.js"></script>

    <link rel="stylesheet" type="text/css" href="css/window.css" />
    <script type="text/javascript" src="js/window.js"></script>

### Include ###

* [jQuery](http://jquery.com/) small, and feature-rich JavaScript library
* [Bootstrap](http://getbootstrap.com) toolkit for developing with HTML, CSS, and JS

### Features ###

* Basic windowing experience
* Create normal and modal windows
* Windows may be resized, maximized, and minimized
* Minimize works by minimizing to a small square that can be moved independently. Clicking it restores to its original size and location. Minimizing again moves the small square back to the last minimized location.
* Emits events

## Simple example ## 

```js
    var opts = {
      idWindow   : '#windowId',
      position   : {top: 70, left: 400},
      dimensions : {width: 400, height: 200},
    };

    var  win =  new Window(opts);

    win.setContentHtml('<h2>HTML Window Content</h2>);

```
## API documentation
[http://phplandia.com/examples/Window/window.html](http://phplandia.com/examples/Window/window.html)

## License  
Released under GPL License.
