#!/usr/bin/env node
'use strict';

let Rx = require('rx'),
    fs = require('fs'),
    path = require('path'),
    handlebars = require('handlebars'),
    cities = require('../src/cities.json'),
    readdir = Rx.Observable.fromNodeCallback(fs.readdir),
    readFile = Rx.Observable.fromNodeCallback(fs.readFile),
    writeFile = Rx.Observable.fromNodeCallback(fs.writeFile),
    mkdir = Rx.Observable.fromNodeCallback(fs.mkdir),
    exists = Rx.Observable.fromCallback(fs.exists);

readdir('./src')
.flatMap(function(filenames) {
  return filenames;
})
.filter(function(filename) {
  console.log(filename)
  return filename.endsWith('.hbs');
})
.flatMap(function(filename) {
  console.log(filename)
  return readFile('./src/' + filename, 'utf8')
  .map(function(template) {
    var hbs = handlebars.compile(template);
    var data = {
      cities : cities
    }
    var html = hbs(data);
    return {
      filename: filename.replace(/\.hbs/, '.html'),
      contents: html
    }
  })
})
.flatMap(function(target) {
  return writeFile('./dist/' + target.filename, target.contents);
})
.subscribe(function() {
  console.log('Generated the pages');
}, function(error) {
  throw error;
});
