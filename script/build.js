'use strict';

let Rx = require('rx'),
    fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers')({
      handlebars: handlebars
    }),
    cities = require('../src/cities.json'),
    glob = require('glob-fs')({ gitignore: true }),
    readdir = Rx.Observable.fromNodeCallback(glob.readdir, glob),
    readFile = Rx.Observable.fromNodeCallback(fs.readFile),
    writeFile = Rx.Observable.fromNodeCallback(fs.writeFile),
    mkdir = Rx.Observable.fromNodeCallback(fs.mkdir),
    exists = Rx.Observable.fromCallback(fs.exists),
    copy = Rx.Observable.fromCallback(fse.copy);

function buildHbs(filename) {
  return readFile(filename, 'utf8')
    .flatMap(function(template) {
      var hbs = handlebars.compile(template);
      var data = {
        cities : cities
      }
      var html = hbs(data);
      let target = filename.replace(/^src/, 'dist').replace(/\.hbs/, '.html');
      return writeFile(target, html)
        .map(function() {
          return target;
        });
    });
}

function run() {
  readdir('./src/**/*.{hbs,js,html}')
  .flatMap(function(filenames) {
    return Rx.Observable.forkJoin(
      filenames.map(function(filename) {
        let type = path.extname(filename);
        switch(type) {
          case '.hbs':
            return buildHbs(filename);
            break;
          default:
            let target = filename.replace(/^src/, 'dist');
            return copy(filename, target)
            .map(function() {
              return target;
            });
        }
      })
    )
  })
  .subscribe(function(filenames) {
    // console.log('Generated the pages', filenames);
  }, function(error) {
    throw error;
  });
}

module.exports = {
  run: run
}