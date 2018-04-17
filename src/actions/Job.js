import api from './Api';
import {JOB_URL} from './Api';

export function getJobs() {
  return {
    types: ['GET_JOBS', 'GET_JOBS_SUCCESS','GET_JOBS_FAILURE'],
    promise: api.get(`${JOB_URL}`)
  }
}

