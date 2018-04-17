'use strict';

const express = require('express');
const config = require('../config');
const bodyParser = require('body-parser');
const fileProcessor = require('./file-processor');
const model = require(`./model-${config.get('DATA_BACKEND')}`);
const router = express.Router();
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));

const storagePath = config.get('STORAGE_PATH');
const storageType = config.get('STORAGE_TYPE');

router.use(bodyParser.json());

/**
 * POST /api/upload
 *
 * Receive file and save it's content as GZIP format
 */
router.post('/upload/:jobName', (req, res, next) => {
  if (req.files === undefined) {
    return next({code: 500, message: 'file not found in request'});
  } else if (req.files.length == 0) {
    return next({code: 500, message: 'file not available'});
  }

  let file = req.files[0];

  if (req.params.jobName == 'join') {
    fileProcessor.deleteFile(file.path);
    return next({code: 500, message: 'invalid job'});
  }

  // check whether file name include any path
  let fileName = file.originalname.replace(/^.*[\\\/]/, '');
  if (fileName != file.originalname) {
    console.error(new Date().toISOString(), `invalid file name: ${file.originalname}`);
    fileProcessor.deleteFile(file.path);
    return next({code: 500, message: 'invalid file name'});
  }

  model.findJob(req.params.jobName)
    .then(job => model.createTask(job, file.path))
    .then(task => {
      // check file name and ensure that it includes only name, not any path
      return fileProcessor.checkPath(task.jobName, storagePath, file.originalname, false)
        .then(outputPathName => fileProcessor.serialize(outputPathName, file, storageType, true))
        .then(outputPathName => {
          task.fileName = outputPathName;
          return fileProcessor.process(task);
        })
        .then(task => model.updateTask(task))
        .then(task =>
          res.json({id: task._id, status: task.status, statusUrl: task.statusUrl})
        )
        .catch(err => {
          task.execResult = err;
          fileProcessor.deleteFile(file.path);
          fileProcessor.completeTask(task, 'error');
          next({code: 500, message: err})
        })
    }).catch(err => {
      fileProcessor.deleteFile(file.path);
      next({code: 500, message: err})
    })
});

/**
 * GET /api/jobs
 *
 * Retrieve jobs on the config
 */
router.get('/jobs', (req, res, next) => {
  model.listJob((err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entities);
  });
});

/**
 * @api (get) /api/tasks
 * @apiDescription This endpoints fetches tasks from local database
 *
 * @apiParam none
 * @apiGroup
 * @apiVersion
 * @apiHeader
 * @apiSuccess
 *
 * @apiSuccessExample
 *
 * @apiErrorExample
 *
 */
router.get('/tasks', (req, res, next) => {
  model.listTask((err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entities);
  });
});

/**
 * GET /api/tasks/:id
 *
 * Retrieve a specific task
 */
router.get('/tasks/:id', (req, res, next) => {
  model.getTask(req.params.id, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entities);
  });
});

/**
 * POST /api/join
 *
 * Run JOIN task. Only one instance of JOIN task can be run in a time.
 */
router.post('/join', (req, res, next) => {
  let jobName = 'join';
  model.findJob(jobName)
    .then(job => model.findTask({
      jobName: job.name,
      status: {$ne: 'end'}})
    .then(task => {
      if (task) {
        return next({code: 500, message: 'JOIN task already running'})
      } else {
        return model.createTask(job, '');
      }
    })
    .then(task => {
      return fileProcessor.process(task)
        .then(task => model.updateTask(task))
        .then(task => res.json({id: task._id, status: task.status, statusUrl: task.statusUrl}))
        .catch(err => {
          fileProcessor.completeTask(task, err);
          next({code: 500, message: err})
        })
    })
    .catch(err => next({code: 500, message: err})))
});

/**
 * Errors on "/api/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = {
    message: err.message,
    internalCode: err.code
  };
  next(err);
});

module.exports = router;
