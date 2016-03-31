import each from 'lodash/each';
import isEmpty from 'lodash/isEmpty';

// Simple Redux-aware API class built as a thin wrapper around fetch. It assumes a REST API that returns
// JSON. This class abstracts away the building of the full URL and the dispatching of Redux actions in
// response to the success or failure of a request. Create one with a schema and a domain, e.g.:
//
//    let api = new API( 'https', 'api.nectarine.org' );
//
// Then call endpoints and get JSON passed directly to your action generators (or regular callbacks):
//
//    api.post({
//      path:     '/api/v1/{frim}/{fram}',   // NOT a template literal -- a string with tokens to interpolate in braces
//      params:   { oss: 22 },               // These will get substituted into the endpoint template
//      data:     { fay: 'Shifafa' },        // This is the POST data to be passed in the body
//      dispatch: dispatch,                  // Optional Redux dispatch, see below
//      success:  ( json, response ) => {
//        console.log( 'frimmed fram: ' + json.fram );  // These callbacks are called directly, but if they return
//        return { type: 'USER_CREATED', json: json };  // a valid Redux action and you provided a dispatch function
//      },                                              // above, that action will be dispatched automatically.
//      failure:  ( json, response ) => {
//        // called if HTTP status was outside the range 200..299
//      },
//      error:    ( json, response ) => {
//        // called if a network or library error occurs, like bad JSON parse
//      }
//    });
//
// But wait - there's more! Use the endpoint method to generate a double-curried function that can be
// provided to React and React-Redux components:
//
//    // in a configuration file somewhere:
//    const updateUser = api.endpoint( 'put', '/api/users/{id}' );
//    ...
//    // then, in mapDispatchToProps somewhere, if didUpdateUser and didNotUpdateUser are action generators:
//    updateUser( myUserObject )({ dispatch, success: didUpdateUser, failure: didNotUpdateUser })
//
//
// TODO: Currently there is no support for multipart POST (i.e. file uploading)... that should be added.
// TODO: We will eventually need support for some authentication mechanisms to be added here.

const defaultFetchArgs = {
  cache:    'no-cache',
  mode:     'cors',
  redirect: 'follow',
};

const defaultHeaders = {
  "Content-Type": "application/json"
};

export default class API {

  constructor( schema, domain, port, fetchArgs = defaultFetchArgs ){
    this.schema    = schema;
    this.domain    = domain;
    this.port      = port;
    this.fetchArgs = fetchArgs; // this can be overridden by external code if needed
  }

  endpoint( method, path, baseHeaders = {} ){
    return ( params, data, bindHeaders = {} ) => {      // Commonly params and data are both the same object, or one is unneeded. If so, no
      data = data === undefined ? {...params} : data    // need to pass it twice -- but if you specifically need NO data, pass explicit null.
      const headers = {...baseHeaders, ...bindHeaders}; // Headers can be provided when an endpoint is built, and/or overridden when it is bound.
      return ({ dispatch, success, failure, error }) => {
        return this[ method ]({ path, params, data, headers, dispatch, success, failure, error });
      };
    };
  }

  get({ path, params = {}, data = {}, headers, dispatch, success, failure, error }){
    return this._call( 'GET', path, params, data, headers, dispatch, success, failure, error );
  }

  post({ path, params = {}, data = {}, headers, dispatch, success, failure, error }){
    return this._call( 'POST', path, params, data, headers, dispatch, success, failure, error );
  }

  put({ path, params = {}, data = {}, headers, dispatch, success, failure, error }){
    return this._call( 'PUT', path, params, data, headers, dispatch, success, failure, error );
  }

  patch({ path, params = {}, data = {}, headers, dispatch, success, failure, error }){
    return this._call( 'PATCH', path, params, data, headers, dispatch, success, failure, error );
  }

  delete({ path, params = {}, data = {}, headers, dispatch, success, failure, error }){
    return this._call( 'DELETE', path, params, data, headers, dispatch, success, failure, error );
  }

  head({ path, params = {}, data = {}, headers, dispatch, success, failure, error }){
    return this._call( 'HEAD', path, params, data, headers, dispatch, success, failure, error );
  }

  _call( method, path, params, data, headers = {}, dispatch = () => {}, success = () => {}, failure = () => {}, error = () => {} ){
    let dataInBody = ( ['PUT','POST','PATCH'].indexOf(method) !== -1 );
    let url  = this._buildURL( path, params, dataInBody ? {} : data );
    let body = dataInBody ? JSON.stringify( data ) : undefined;
    return fetch( url, {
      ...this.fetchArgs, method, body, headers: { ...defaultHeaders, ...headers }
    }).then((response) => {
      let handler = response.ok ? success : failure;
      response.json()
      .then((json) => this._dispatch( dispatch, handler, json, response ))
      .catch((err) => this._dispatch( dispatch, error, err, response ));
    }).catch((err) => this._dispatch( dispatch, error, err, undefined ));
  }

  _dispatch( dispatch, handler, arg, response ){
    let result = handler( arg, response );
    if( dispatch && result && result['type'] ){
      // This check avoids dispatching undefined events if the handler
      // was a classic callback instead of a Redux action generator.
      dispatch( result );
    }
  }

  _buildURL( path, pathParams, queryParams ){
    let {domain, schema, port} = this;
    path   = this._interpolate( path, pathParams );
    path   = this._attachQuery( path, queryParams );
    path   = path[0] == '/' ? path.slice(1) : path;
    domain = domain.slice(-1) == '/' ? domain.slice(0,-1) : domain;
    port   = port ? `:${port}` : '';
    return `${schema}://${domain}${port}/${path}`
  }

  _interpolate( route, bindings ){
    // There are many route interpolation algorithms in the world; this one is more naive
    // than many, but is only a few lines long and fits our use case just fine. Parts are
    // only processed once to avoid the possibility of nested replacements. Any replacements
    // not present in the bindings object are left as is.
    if( !bindings || isEmpty( bindings ) ){
      return route;
    }
    let parts = route.split(/(\/|\.|\?)/); // capture group here is important
    each( parts, (value, index) => {
      let match = value.match(/^\{([a-zA-Z0-9_]+)\}$/); // here too
      if( match && match[1] && bindings[ match[1] ] ){
        parts[ index ] = encodeURIComponent( String( bindings[ match[1] ] ) );
      }
    });
    return parts.join('');
  }

  _attachQuery( path, params ){
    if( !params || isEmpty( params ) ){
      return path;
    }
    let pairs = [];
    each( params, (value, key) => {
      if( value.constructor === Array ){
        each( value, (v) => pairs.push( [`${key}[]`, encodeURIComponent( String(v) )].join('=') ) );
      } else {
        pairs.push( [key, encodeURIComponent( String(value) )].join('=') );
      }
    });
    return `${path}${path.match(/\?/)?'&':'?'}${pairs.join('&')}`;
  }

}
