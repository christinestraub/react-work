import Immutable from 'immutable'

const options = {
  loaded: false,
  loading: false,
  uploadResult: null,
  err: null,
};

let defaultState = new Immutable.Map(options);

export default function uploadReducer(state = defaultState, action) {
  switch (action.type) {

    case 'UPLOAD':
      return state.set('loading', true)
        .set('uploadResult', null);
    case 'UPLOAD_SUCCESS':
      let uploadResult = action.res.data;
      return state.set('loading', false)
        .set('loaded', true)
        .set('uploadResult', uploadResult);
    case 'UPLOAD_FAILURE':
      return state.set('err', action.err)
        .set('uploadResult', action.err.response.data);

    default:
      return state;
  }
}
