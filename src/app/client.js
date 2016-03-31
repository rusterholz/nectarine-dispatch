import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Link, browserHistory} from 'react-router';
import routes from './routes';
import reducers from './reducers';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {routerReducer, syncHistoryWithStore} from 'react-router-redux';

const contentElement = 'nectarine';

if( browserHistory != undefined ){ // If so, we're executing client-side.

  var store   = createStore( combineReducers({ ...reducers, routing: routerReducer }) );
  var history = syncHistoryWithStore( browserHistory, store );

  render(
    <Provider store={store}>
      <Router history={history}>
        {routes}
      </Router>
    </Provider>,
    document.getElementById( contentElement )
  );

}

export const exports = {
  contentElement,
  routes,
};
