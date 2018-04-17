'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const config = require('../config');

/**
 * initialize the storage for jobs
 * it creates the directory for each job's name
 *
 * @param jobs
 */
function initStorage(jobs) {
  let storagePath = config.get('STORAGE_PATH');

  // ensure the storage path is exists
  fs.ensureDirSync(storagePath);

  // create directory for each job
  jobs.forEach(job => {
    // Ensures that the directory exists. If the directory structure does not exist, it is created. Like mkdir -p.
    fs.ensureDirSync(path.join(storagePath, job.name));
  });

  // remove all temporary files
  let files = fs.readdirSync(storagePath);
  files.forEach(file => {
    let filePathName = path.join(storagePath, file);
    let fsStat = fs.statSync(filePathName);
    if (fsStat.isFile()) {
      fs.unlink(filePathName);
    }
  });
}

let jobs = config.get('jobs');
if (typeof jobs !== 'undefined') {
  initStorage(jobs);
}
