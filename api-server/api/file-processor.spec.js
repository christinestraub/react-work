const config = require('../config');
const fileProcessor = require('./file-processor');

describe('Compress Buffer', function () {
  beforeEach(function (done) {
    done();
  });
  it('should be run script successfully', function (done) {
    let script = ['dir', 'type'];
    let outputPathName = `${config.get('STORAGE_PATH')}\\TEST_JOB\\test.txt.gz`;

    fileProcessor.process(outputPathName, script)
      .then(result => {
        console.log(result);
        done();
      }).catch(err => {
      console.error(err);
      done();
    })
  });
  it('should be failed to run script', function (done) {
    let script = ['donothing'];
    let outputPathName = `${config.get('STORAGE_PATH')}\\TEST_JOB\\test.txt.gz`;

    fileProcessor.process(outputPathName, script)
      .then(result => {
        console.log(result);
        done();
      }).catch(err => {
      console.error(err);
      done();
    })
  });
});
