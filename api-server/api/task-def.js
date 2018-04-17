'use strict';

/**
 * define constants for task's status
 *
 * Task's life cycles is following:
 *
 *    CREATED: task object created and stored in memory(db)
 *    PENDING: task object enqueued in the task queue
 *    RUNNING: the script of the task is running
 *    END: task finished or timeout
 *
 * @type {{CREATED: string, PENDING: string, RUNNING: string, END: string}}
 */
exports.taskStatus = {
  CREATED: 'created',
  PENDING: 'pending',
  RUNNING: 'running',
  END: 'end',
};

/**
 * define constants for task's result
 *
 * Task's result can have following values
 *
 *    SUCCESS: the task finished successfully
 *    ERROR: the execution of the task return error
 *    TIMEOUT: the execution of the task not completed in timeout
 *
 * @type {{SUCCESS: string, ERROR: string, TIMEOUT: string}}
 */
exports.taskResult = {
  SUCCESS: 'success',
  ERROR: 'error',
  TIMEOUT: 'timeout',
};
