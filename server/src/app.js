/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';
import cluster from 'cluster';

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// Populate databases with sample data
if(config.seedDB) {
  require('./config/seed');
}

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

if(cluster.isMaster) {
  var cpuCount = require('os').cpus().length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  // Listen for dying workers
  cluster.on('exit', function () {
    cluster.fork();
  });
} else {

// Setup server
  var app = express();
  var server = http.createServer(app);
  var socketio = require('socket.io')(server, { origins: '*:*', transports: ['websocket', 'polling'], serveClient: config.env === 'production', path: '/socket.io'});
  require('./config/socketio').default(socketio);
  require('./config/express').default(app);
  require('./routes').default(app);

  setImmediate(startServer);
}

// Expose app
exports = module.exports = app;
