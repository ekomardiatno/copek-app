import {Dimensions} from 'react-native'
const { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
export const LATITUDE_DELTA = 0.02
// export const LATITUDE_DELTA = 0.0922
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
export const NODE_APP_URL = 'https://ekomardiatno.site:3000/'
export const HOST_REST_API = 'https://ekomardiatno.site/copek/api/'