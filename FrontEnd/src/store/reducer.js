// third party
import { combineReducers } from 'redux';

// project import
import customizationReducer from './reducers/customizationReducer';
import user from './reducers/login';
import selected from './reducers/selected';
import pagination from './reducers/pagination';
import sendEnquire from './reducers/sendEnquireReducer';

// ==============================|| REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  user: user,
  selected: selected,
  pagination: pagination,
  sendEnquire: sendEnquire
});

export default reducer;
