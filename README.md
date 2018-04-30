# HTML/JS windows system

A window manager written in Javascript, HTML5 and CSS3.

This project started as an entertainment, feel free to download and use or fork!

### Live Demo ###

[Demo](https://mazius.org)

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

    win.setContentHtml(opts.idWindow);

```
