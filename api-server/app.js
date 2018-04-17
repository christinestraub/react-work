'use strict';

const express = require('express');
const config = require('./config');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const taskEvent = require('./api/task-event');

// file multipart/form-data parsing. Accepts any file name using .any()
function createStore(storageType) {
  if (storageType === 'memory') {
    return multer.memoryStorage();
  } else {
    return {dest: path.join(__dirname, 'storage')};
  }
}

// seed database
require(`./config/seed-${config.get('DATA_BACKEND')}`);

const app = express();

app.disable('etag');
app.set('trust proxy', true);

// attempting to solve cors issues - need to be tightened up because this allows everything
app.use(cors());

app.use(express.static(path.join(__dirname, '../build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// set multer for uploading of file
app.use('/api/upload', multer(createStore(config.get('STORAGE_TYPE'))).any());

// route
app.use('/api', require('./api/routes'));

// Basic 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use((err, req, res, next) => {
  /* jshint unused:false */
  console.error(new Date().toISOString(), err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  // Start the server

  // create web socket server
  const server = require('http').Server(app);
  const io = require('socket.io')(server);
  require('./api/monitor-socket')(io, taskEvent);

  server.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(new Date().toISOString(), `App listening on port ${port}`);
  });
}

module.exports = app;
