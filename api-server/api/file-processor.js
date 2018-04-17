'use strict';

const config = require('../config');
const zlib = require('zlib');
const streamifier = require('streamifier');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const exec = require('child-process-promise').exec;
const queue = require('queue');
const q = queue();
const model = require(`./model-${config.get('DATA_BACKEND')}`);
const taskStatus = require('./task-def').taskStatus;
const taskResult = require('./task-def').taskResult;

// The flag indicates whether the uploaded file will be deleted after the processing of the file was ended
let needDeleteFile = config.get('DELETE_FILE');
// Maximum time that file processing should be completed (in ms)
let taskTimeout = config.get('TASK_TIMEOUT') * 1000;
// maximum queue size
let queueSize = config.get('MAX_QUEUE_SIZE');
// Maximum number of concurrent task
q.concurrency = config.get('CONCURRENCY');
// Ensures the queue is always running if jobs are available.
q.autostart = true;
// q.timeout = taskTimeout;

/**
 * After a job executes its callback.
 *
 * @param task executed task
 * @param job the executed function
 */
q.on('success', function (task) {
  if (task.result == taskResult.TIMEOUT) {
    fileProcessor.completeTask(task, taskResult.TIMEOUT);
  } else {
    fileProcessor.completeTask(task, taskResult.SUCCESS);
  }
});

/**
 * After a job passes an error to its callback.
 *
 * @param err error object
 */
q.on('error', function (err) {
  fileProcessor.completeTask(err.task, taskResult.ERROR);
});

/**
 * After q.timeout milliseconds have elapsed and a job has not executed its callback.
 *
 * (note) Currently this callback not used, instead please see q.on('success', function).
 *
 * @param next next function
 * @param job not executed function
 */
q.on('timeout', function (next, job) {
  // todo: we need to get task from job
  console.log(new Date().toISOString(), JSON.stringify(job));
  fileProcessor.completeTask(task, taskResult.TIMEOUT);
  next();
});

/**
 * callback if all jobs have been processed
 *
 * @param err error object
 */
q.on('end', function (err) {
  if (err) {
    console.error(new Date().toISOString(), `${err}`);
  }
  console.log(new Date().toISOString(), `all task in the queue were completed`);
});

/**
 * generate real script from task's fileName and job's script
 *
 * @param jobName name of job
 * @param fileName name of file to be processed
 * @param script
 * @returns {XML|string|*}
 */
const prepareCommand = function (jobName, fileName, script) {
  // check if the task has the file to be processed and replace the $file in the script
  if (fileName === undefined || fileName === null || fileName === '') {
    return script;
  } else {
    return script.replace(/\$job/g, jobName).replace(/\$file/g, '\"' + fileName + '\"');
  }
};

const fileProcessor = {
  /**
   * serialize uploaded file (or buffer) to storage directory corresponding to a job
   *
   * @param outputPathName the file path and name to be output
   * @param file file object
   * @param storageType storage type(memory or file) for uploaded file
   * @param compressed indicates the uploaded file is compressed or not
   *
   * @return new promise for task
   */
  serialize: function (outputPathName, file, storageType, compressed) {
    return new Promise((resolve, reject) => {
      try {
        if (storageType == 'memory') {
          // if storageType is 'memory', the content of uploaded file is stored in the buffer of file object.
          // we store the content as GZIPed archive
          let input = streamifier.createReadStream(file.buffer)
            , output = fs.createWriteStream(outputPathName);
          if (compressed) {
            input.pipe(output);
          } else {
            input.pipe(zlib.createGzip()).pipe(output);
          }
        } else {
          // if storageType is 'file', the uploaded file is temporally stored in the storage directory and
          // this file's name is file.path
          fs.renameSync(file.path, outputPathName);
        }
        return resolve(outputPathName);
      } catch (e) {
        return reject(e);
      }
    });
  },
  /**
   * check the directory and file in which the uploaded file will be saved
   * if the file with same name is already exists and allowOverwrite is false, it fails and return error
   *
   * @param jobName job name associated with the file
   * @param filePath root path
   * @param fileName name of uploaded file
   * @param allowOverwrite indicates if there allowed the file overwrites (currently this flag is always false)
   * @returns {Promise}
   */
  checkPath: function (jobName, filePath, fileName, allowOverwrite) {
    let outputPath = path.join(filePath, jobName);
    let outputPathName = path.join(outputPath, fileName);

    // check if the outputPath exists and have a correct permission
    fs.ensureDirSync(filePath);
    fs.ensureDirSync(outputPath);

    return new Promise((resolve, reject) => {
      fs.access(outputPathName, fs.constants.F_OK, (err) => {
        if (err || allowOverwrite) {
          return resolve(outputPathName);
        } else {
          return reject('file already exists');
        }
      })
    })
  },
  /**
   * process file asynchronously.
   * the task object be enqueued in the queue. task object has following properties
   *
   {
      job: job object
      jobName: name of job associated with the file. this field is equal with job.name
      fileName: the path and name of the uploaded file in the storage location
      startTime: time of job is started
      endTime: time of job is ended
      status: job's status, can be on of the ['created', 'pending', 'running', 'end]
      result: the end status of the task, can be one of the ['success', 'error', 'timeout']
      execResult: contains the result(return code, stdout, stderr, ...) from exec command
   }
   *
   * @param task
   * @returns {Promise}
   */
  process: function (task) {
    task.cmd = prepareCommand(task.jobName, task.fileName, task.job.script);

    return new Promise((resolve, reject) => {

      model.updateStatus(task, taskStatus.PENDING);

      // check the total count of the pending and running jobs in the queue
      if (q.length > queueSize) {
        return reject('queue size exceed the maximum limit');
      }

      // add the task in the job queue
      q.push(function (cb) {
        task.startTime = Date.now() / 1000 | 0;
        model.updateStatus(task, taskStatus.RUNNING);

        // set timeout callback
        // we use this callback instead of the queue timeout
        setTimeout(() => {
          task.result = taskResult.TIMEOUT;
          return cb(null, task);
        }, taskTimeout);

        // execute the command and handle result
        exec(task.cmd)
          .then(function (result) {
            task.result = taskResult.SUCCESS;
            task.execResult = {
              stderr: result.stderr,
              stdout: result.stdout,
            };
            return cb(null, task);
          })
          .catch(function (err) {
            task.result = taskResult.ERROR;
            task.execResult = {
              code: err.code,
              message: err.message,
              name: err.name,
              stderr: err.stderr,
              stdout: err.stdout,
            };
            err.task = task;
            return cb(err);
          });
      });
      // begin processing, get notified on end / failure
      return resolve(task)
    });
  },
  /**
   * process file synchronously (currently not used)
   * see process() function
   *
   * @param task
   */
  processSync: function (task) {
    task.cmd = prepareCommand(task.jobName, task.fileName, task.job.script);

    return new Promise((resolve, reject) => {

      model.updateStatus(task, taskStatus.RUNNING);

      exec(task.cmd, (error, stdout, stderr) => {
        task.endTime = new Date().getTime();
        if (error) {
          task.result = taskResult.ERROR;
          task.execResult = {
            error: error,
            stderr: stderr,
            stdout: stdout,
          };
          model.updateStatus(task, taskStatus.END);
          return reject(error)
        } else {
          task.result = taskResult.SUCCESS;
          task.execResult = {
            stderr: stderr,
            stdout: stdout,
          };
          model.updateStatus(task, taskStatus.END);
          return resolve(task)
        }
      });
    });
  },
  /**
   * delete file specified by path and name
   *
   * @param filePathName file path & name to be deleted
   */
  deleteFile(filePathName) {
    if (fs.existsSync(filePathName)) {
      fs.unlinkSync(filePathName);
    }
  },
  /**
   * complete task with result
   *
   * @param task
   * @param result
   */
  completeTask(task, result) {
    task.endTime = Date.now() / 1000 | 0;
    task.result = result;
    task.status = taskStatus.END;
    return model.updateTask(task);
  },
};

module.exports = fileProcessor;