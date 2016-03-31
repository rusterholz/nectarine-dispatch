import { SHIFAFA } from './actions'

const foo = ( state = {}, action ) => {
  switch( action.type ){
    case SHIFAFA:
      return { ...state, ...action.json };
    default:
      return state;
  }
};

const bar = ( state = {}, action ) => {
  switch( action.type ){
    case SHIFAFA:
      return { ...state, ...action.json };
    default:
      return state;
  }
};

export default ({
  foo,
  bar
});
