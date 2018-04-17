/**
 * return connection object to database
 */
'use strict';

require('dotenv').config();

let db = null;

if (process.env.DATA_BACKEND == 'sqlite') {
  let sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database('memory');
} else {
  let Datastore = require('nedb');
  db = new Datastore();
}

module.exports = db;