import { combineReducers } from 'redux'

import todos from './todos.reducers'
import users from './users.reducers'
import locations from './locations.reducers'

const rootReducer = combineReducers({
  todos,
  users,
  locations
})

export default rootReducer