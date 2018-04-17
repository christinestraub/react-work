REACT QUEUE
===========

##1. Architecture

The project consists of 2 parts, *api-server* and *front-end* UI for testing. 

**api-server**

The api-server is based on node.js and express and uses [multer](https://ewiggin.gitbooks.io/expressjs-middleware/content/multer.html) middleware to handle uploading of file.
For model layer, server uses [nedb](https://github.com/louischatriot/nedb) memory database.
The configuration parameters can be defined in `.env`, `config.json`, `config.js` files and can be passed directly by argument. 
[nconf](https://www.npmjs.com/package/nconf) package will manage the configuration parameters from various source.

- Promise

  All the promise processes are handled by [bluebird](http://bluebirdjs.com/docs/getting-started.html) package.

- Concurrent tasking
  
  All concurrent tasks are handled by [queue](https://www.npmjs.com/package/queue) package and support limited concurrent job tasking

**front-end**

The front-end app is built on top of [react](https://facebook.github.io/react/).
The app is generated using [create-react-app](https://github.com/facebookincubator/create-react-app).
It uses [react-bootstrap](https://react-bootstrap.github.io/) and [react-bootstrap-table](https://github.com/AllenFang/react-bootstrap-table) components for UI.
To consume BDR API [react-redux](https://github.com/reactjs/react-redux) and promise middleware, [axios](https://github.com/mzabriskie/axios).    

**Project Structure**
  
  __api-server__
  
  * config: job configuration (in JSON format) and database seed
  * api: routes and file processor, model
  * scrips: the script to be run
   
  __build__
  
  the build result of the front-end app is located in this directory.

  __documentation__
  
  this documentation    

  __public__

  the pre-defined html, css, js files in this directory will be handled by webpack when the app is building. 

  __src__
  
  * actions: redux actions for api
  * components: UI components, *FileUploadWidget* and *TaskTableWidget*
  * lib: promise middleware to run axios
  * reducers

**Configuration**

    DATA_BACKEND: 'nedb',
    PORT: 8097,
    STORAGE_PATH: path.join(__dirname, 'storage'),
    STORAGE_TYPE: 'file',
    CONCURRENCY: 4,
    TASK_TIMEOUT: 2400,   // max. 40 min
    DELETE_FILE: true,
    MAX_QUEUE_LEN: 20

**Data Structure**
  
  - job

    the model that represents the job can be run on the server

    `name`: job object  
    `scripts`: the script will be run for task for the job      

  - task
    
    the model that represents job's running status and result.
    the life cycle of the task is following:

        created: task object created and stored in memory(db)
        pending: task object enqueued in the task queue
        running: the script of the task is running
        end: task finished or timeout
    
    the result of the task can be one of:
         
         success: the task ccompleeted successfully (without error)
         error: the execution of the task return error
         timeout: the execution of the task not completed in timeout
    
    following are task object's properties:
     
    `job`: job object  
    `jobName`: name of job associated with the file. this field is equal with job.name    
    `fileName`: the path and name of the uploaded file in the storage location  
    `startTime`: time of job is started  
    `endTime`: time of job is ended  
    `status`: job's status, can be on of the *created*, *pending*, *running*, *end*    
    `result`: the end status of the task, can be one of the *success*, *error*, *timeout*    
    `execResult`: contains the result(return code, stdout, stderr, ...) from exec command
   
**Concurrent Tasking**

  API server uses  package to process file task concurrently.  
  The queue's `timeout` event not handled by it's callback, instead it uses `setTimeout()` function to handle   

**Script Example**

   There are two sample script that are used to test the file processing.
   
   - process_file.sh

    #!/bin/bash   
    sleep 120
    echo "$0 done"

   
   - s3upload.sh
       
    #!/bin/bash   
    sleep 120
    echo "$0 done"
   
**Deployment**

  After clone the source from bitbucket or gitlab, please run *deploy.sh*.


##2. API ENDPOINTS

**Job Info**

    - URL: GET /api/jobs
    - Description: Get info of job
    - Request: None
    - Response: list of jobs
    - Example:
    [
        {
            "name": name of job,
            "script": shell script (can be single or multiple joined with &&)
        }
    ]
    - CURL:  `curl http://localhost:8097/api/jobs`

**File Uploading**

    - URL: POST /api/upload
    - Description: Upload file in multipart-formdata
    - Request: multipart-from-data includeing file contents
    - Response: Status of the assigned task
    - Example:
    [
        {
            "id": id of task,
            "status": current status of the task, 'pending' | 'running' | 'end'
            "statusUrl": url to check the status of the task
        }
    ]
    - CURL: `curl -F "file=@story.md" http://localhost:8097/api/upload/JOB_A`
 
**Tasks**

    - URL: GET /api/tasks
    - Description: Get list of tasks
    - Request: None
    - Response: JSON array of task
    - Example:
    [
        {
            "_id": id of the task,
            "jobName": name of job associated with the task,
            "startTime": start time, 
            "endTime": end time,
            "result": result of the task [success | error | timeout], 
            "status": status of the task [created | pending | running | end]
        }
    ]
    - CURL: `curl http://localhost:8097/api/tasks`

**Join**

    - URL: POST /api/join
    - Description: run JOIN task asynchronously and return the status of the started task
    - Request: None
    - Response: result of JOIN task
    - Example:
    [
        {
            "_id": id of the task,
            "status": status of the task [created | pending | running | end]
            "statusUrl": url of the task's running status
        }
    ]
    - CURL: `curl --data "" http://localhost:8097/api/join`

##3. TODO

- Real-time view of the task
- Using dev env in front-end
