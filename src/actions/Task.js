import api from './Api';
import {TASK_URL} from './Api';

export function getTasks() {
  return {
    types: ['GET_TASKS', 'GET_TASKS_SUCCESS','GET_TASKS_FAILURE'],
    promise: api.get(`${TASK_URL}`)
  }
}

export function getTask(id) {
  return {
    types: ['GET_TASK', 'GET_TASK_SUCCESS','GET_TASK_FAILURE'],
    promise: api.get(`${TASK_URL}/${id}`)
  }
}
