import React, {PropTypes, Component} from 'react';
import { frimFram } from './../endpoints';
import { shifafa } from './../actions';
import Header from '@nectarine-dispatch/header';

export default class AppContainer extends Component {

  componentDidMount(){
    let {dispatch} = this.context.store;

    let ossFay = { frim: 23, fram: 42 };

    // When the app is first loaded, we call the frimFram endpoint for the ossFay
    // object, and dispatch the shifafa action with the resulting json:
    frimFram( ossFay, null )({ dispatch, success: shifafa });
  }

  render(){
    return (
      <div id="app">
        <Header />
        {this.props.children}
      </div>
    );
  }

}

AppContainer.displayName = 'AppContainer';

AppContainer.contextTypes = {
  store: PropTypes.object
};
