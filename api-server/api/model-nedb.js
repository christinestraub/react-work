'use strict';

const db = require('../connection');
const taskStatus = require('./task-def').taskStatus;
const taskEvent = require('./task-event');
const config = require('../config');
const jobs = config.get('jobs');
/**
 * Get a list of all jobs
 *
 * @param cb
 */
function listJob(cb) {
  if (jobs) {
    cb(null, jobs.map(item => item.name));
  } else {
    return cb({code: 500, message: `jobs not exists`});
  }
}

/**
 * Find job by a specific name
 *
 * @param jobName
 * @result {Promise}
 */
function findJob(jobName) {
  return new Promise((resolve, reject) => {
    if (jobs) {
      return resolve(jobs.filter(job => job.name == jobName)[0]);
    } else {
      return reject({code: 404, message: 'not found'});
    }
  });
}

/**
 * Get a fill list of task
 *
 * @param cb
 */
function listTask(cb) {
  let filter = {jobName: {$exists: true}};
  db.find(filter).exec((err, tasks) => {
      if (err) {
        return cb(err);
      }
      // sort by create time
      tasks.sort((a, b) => { return a.createTime < b.createTime; });
      cb(null, tasks);
    }
  );
}

/**
 * get task by task id
 *
 * @param id
 * @param cb
 */
function getTask(id, cb) {
  let filter = {_id: id};
  db.findOne(filter).exec((err, task) => {
      if (err) {
        return cb(err);
      } else if (task == null) {
        return cb({code: 404, message: 'not found'});
      }
      cb(null, task);
    }
  );
}

/**
 * Create new task to be executed for a job
 *
 * @param job
 * @param fileName
 */
function createTask(job, fileName) {
  return new Promise((resolve, reject) => {
    let task = {
      jobName: job.name,
      job: job,
      createTime: Date.now() / 1000 | 0,
      startTime: 0,
      endTime: 0,
      status: taskStatus.CREATED,
      fileName: fileName
    };
    return db.insert(task, (err, newTask) => {
      if (err) {
        return reject(err);
      } else {
        newTask.statusUrl = `/tasks/${newTask._id}`;
        taskEvent.emit('created', newTask);
        return resolve(newTask);
      }
    });
  });
}

/**
 * Promise to update task
 *
 * @param task
 * @returns {Promise}
 */
function updateTask(task) {
  return new Promise((resolve, reject) => {
    return db.update({_id: task._id}, task, (err) => {
      if (err) {
        return reject(err);
      } else {
        taskEvent.emit('updated', task);
        return resolve(task);
      }
    });
  });
}

/**
 * Find task by filter
 *
 * @param filter
 */
function findTask(filter) {
  return new Promise((resolve, reject) => {
    return db.findOne(filter, (err, task) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(task);
      }
    });
  });
}

/**
 * Update status of a task
 *
 * @param task
 * @param status
 */
function updateStatus(task, status) {
  console.log(new Date().toISOString(), `task ${task._id} status ${task.status} => ${status}`);
  task.status = status;
  return updateTask(task)
}


module.exports = {
  listJob: listJob,
  findJob: findJob,
  listTask: listTask,
  getTask: getTask,
  createTask: createTask,
  updateTask: updateTask,
  findTask: findTask,
  updateStatus: updateStatus
};
