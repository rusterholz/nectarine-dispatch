import { connect } from 'react-redux';
import BookView from '@nectarine-dispatch/bookView';

export const BookContainer = connect(
  (state, ownProps) => {
    // mapStateToProps
    return {};
  },
  (dispatch, ownProps) => {
    // mapDispatchToProps
    return {};
  }
)( BookView );
