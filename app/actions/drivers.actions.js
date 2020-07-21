import { NODE_APP_URL } from '../components/Define'

export const getNearDrivers = (location) => {
  let uri = encodeURI(`${NODE_APP_URL}drivers/near/${location.lng}/${location.lat}`)
  return new Promise((resolve, reject) => {
    fetch(uri)
      .then(res => res.json())
      .then(resolve)
      .catch(reject)
  })
}