'use strict';

const watch = require('watch'),
      build = require('./build');

function start() {
  watch.createMonitor('./src/', function (monitor) {
    monitor.on("created", function (filename, stat) {
      fileChanged(filename, stat);
    });
    monitor.on("changed", function (filename, stat, statPrevious) {
      fileChanged(filename, stat);
    });
    monitor.on("removed", function (filename, stat) {
      fileChanged(filename, stat);
    });
  });
}

function fileChanged(filename, stat) {
  console.log(`${filename} changed.`);
  build.run();
}

module.exports = {
  start: start
}