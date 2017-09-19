'use strict';

var config = require('./src/config');
var App = require('./src/App');

var app = new App(config);

// Where the magic happens
app.run();