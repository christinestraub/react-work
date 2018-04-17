/**
 * Created by x-nazar.a on 4/29/2017.
 */
'use strict';

/**
 *
 * @param io
 * @param taskEvent
 */
module.exports = function (io, taskEvent) {

  io.on('connection', function (socket) {
    socket.emit('news', { event: 'connected', task: [] });
    socket.on('ack', function (data) {
      // console.log('ack', data);
    });

    taskEvent.on('created', function (task) {
      // console.log('task', task._id, 'created');
      socket.broadcast.emit('news', { event: 'created', task: task });
    });

    taskEvent.on('updated', function (task) {
      // console.log('task', task._id, 'updated');
      socket.broadcast.emit('news', { event: 'updated', task: task });
    })
  });
};
