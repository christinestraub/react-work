import Immutable from 'immutable'

const options = {
  loaded: false,
  tasks: [],
  task: {},
  err: null,
};

let defaultState = new Immutable.Map(options);

export default function taskReducer(state = defaultState, action) {
  switch (action.type) {

    case 'GET_TASKS':
      return state.set('loading', true);
    case 'GET_TASKS_SUCCESS':
      let tasks = action.res.data;
      return state.set('loading', false)
        .set('loaded', true)
        .set('tasks', tasks);
    case 'GET_TASKS_FAILURE':
      return state.set('err', action.err);

    case 'GET_TASK':
      return state.set('loading', true);
    case 'GET_TASK_SUCCESS':
      let task = action.res.data;
      return state.set('loading', false)
        .set('loaded', true)
        .set('task', task);
    case 'GET_TASK_FAILURE':
      return state.set('err', action.err);

    default:
      return state;
  }
}
