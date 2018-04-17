import api from './Api';
import {JOIN_URL} from './Api';

export function join() {
  return {
    types: ['JOIN', 'JOIN_SUCCESS', 'JOIN_FAILURE'],
    promise: api.post(`${JOIN_URL}`)
  }
}

