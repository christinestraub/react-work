import Immutable from 'immutable'

const options = {
  loaded: false,
  jobs: [],
  err: null,
};

let defaultState = new Immutable.Map(options);

export default function jobReducer(state = defaultState, action) {
  switch (action.type) {

    case 'GET_JOBS':
      return state.set('loading', true);
    case 'GET_JOBS_SUCCESS':
      let jobs = action.res.data;
      return state.set('loading', false)
        .set('loaded', true)
        .set('jobs', jobs);
    case 'GET_JOBS_FAILURE':
      return state.set('err', action.err);

    default:
      return state;
  }
}
