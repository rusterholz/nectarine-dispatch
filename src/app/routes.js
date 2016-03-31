import React from 'react';
import {Router, Route, IndexRoute} from 'react-router';
import {AppContainer, BookContainer} from './containers';

export default (
  <Route path="/" component={AppContainer}>
    <IndexRoute component={BookContainer}/>
  </Route>
);
