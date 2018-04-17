import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {Provider} from 'react-redux';
import * as reducers from './reducers'
import {combineReducers, createStore, applyMiddleware} from 'redux';

import promiseMiddleware from './lib/promiseMiddleware';

const logger1 = store => next => action => {
  let result = next(action);
  // console.log('logger1', result);
  return result;
};

const reducer = combineReducers({
  ...reducers,
});
let createStoreWithMiddleware = applyMiddleware(promiseMiddleware, logger1)(createStore);
const store = createStoreWithMiddleware(reducer);

ReactDOM.render(
  <Provider store={store}>
    <App history={history}/>
  </Provider>,
  document.getElementById('root')
);
