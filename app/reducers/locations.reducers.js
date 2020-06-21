import { 
  DATA_PLACES
} from '../actions/locations.actions'
import { LATITUDE_DELTA, LONGITUDE_DELTA } from '../components/Define'

export default (state = {}, action) => {
  switch(action.type) {
    case DATA_PLACES:
      return {
        ...state,
        places: action.payload
      }
    default:
      return state
  }
}