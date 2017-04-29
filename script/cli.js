#!/usr/bin/env node
const build = require('./build'),
      watch = require ('./watch'),
      args = process.argv;

switch (args[2]) {
  case 'build':
    console.log('Build...');
    build.run();
  break;
  case 'watch':
    console.log('Watching...');
    watch.start();
  break;
  default:
    console.log('Invalid argument', args[2]);
}