'use strict';

const EventEmitter = require('events');

// create event emitter for task
class TaskEventEmitter extends EventEmitter {}
const taskEventEmitter = new TaskEventEmitter();

module.exports = taskEventEmitter;
