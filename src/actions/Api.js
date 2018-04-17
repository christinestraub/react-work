import axios from 'axios';

const API_BACKEND = (process.env.NODE_ENV === 'development') ? 'http://localhost:8097': '';

export const UPLOAD_URL = '/api/upload';
export const JOB_URL = '/api/jobs';
export const TASK_URL = '/api/tasks';
export const JOIN_URL = '/api/join';

let instance = axios.create({
  baseURL: API_BACKEND,
});

export default instance;
