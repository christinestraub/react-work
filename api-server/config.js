'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
const nconf = module.exports = require('nconf');
const path = require('path');

nconf
// 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'DATA_BACKEND',
    'PORT'
  ])
  // 3. Config file
  .file({file: path.join(__dirname, 'config.json')})
  .file({file: path.join(__dirname, 'config', 'jobs.config.json')})
  // 4. Defaults
  .defaults({
    // dataBackend can be 'nedb', 'sqlite', or 'mongodb'. Be sure to
    // configure the appropriate settings for each storage engine below.
    DATA_BACKEND: 'nedb',

    // Port the HTTP server
    PORT: 8097,

    // Storage Path
    STORAGE_PATH: path.join(__dirname, 'storage'),

    // storage type
    // memory: multer uses memory as content's storage
    // file: multer uses directory as content's storage
    STORAGE_TYPE: 'file',

    // maximum concurrent tasks
    CONCURRENCY: 4,

    // task timeout in seconds
    TASK_TIMEOUT: 7200,   // max. 2 hours = 7200s

    // delete file after task completed or timeout
    DELETE_FILE: false,

    // maximum queue size
    MAX_QUEUE_SIZE: 20
  });

/**
 * check configuration variable
 * @param setting
 */
function checkConfig(setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
  }
}
