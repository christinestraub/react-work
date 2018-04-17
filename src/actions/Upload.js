import api from './Api';
import {UPLOAD_URL} from './Api';

export function uploadFile(job, file, compressed, uploadProgressCallback) {
  let data = new FormData();

  data.append('compressed', compressed);
  data.append('file', file);

  let config = {
    onUploadProgress: uploadProgressCallback
  };

  return {
    types: ['UPLOAD', 'UPLOAD_SUCCESS', 'UPLOAD_FAILURE'],
    promise: api.post(`${UPLOAD_URL}/${job}`, data, config)
  }
}

