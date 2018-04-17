import Immutable from 'immutable'

const options = {
  loaded: false,
  loading: false,
  joinResult: null,
  err: null,
};

let defaultState = new Immutable.Map(options);

export default function joinReducer(state = defaultState, action) {
  switch (action.type) {

    case 'JOIN':
      return state.set('loading', true)
        .set('joinResult', null);
    case 'JOIN_SUCCESS':
      let joinResult = action.res.data;
      return state.set('loading', false)
        .set('loaded', true)
        .set('joinResult', joinResult);
    case 'JOIN_FAILURE':
      return state.set('err', action.err)
        .set('joinResult', action.err.response.data);

    default:
      return state;
  }
}
