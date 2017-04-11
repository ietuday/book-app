'use strict';

export function register(socket, io) {
  // when server recieve online event, send back to all connected sockets event connect:admin
  socket.on('online', function() {
    io.emit('connect:admin');
  });

  socket.on('offline', function() {
    io.emit('disconnect:admin');
  });

  socket.on('question', function(message, username, socketId) {
    io.emit('question', { text: message, author: username, socketId: socketId });
  });

  socket.on('answer', function(message, username, socketId) {
    io.to(socketId).emit('answer', { text: message, author: username });
  });
}
