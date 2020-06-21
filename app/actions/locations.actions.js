import AsyncStorage from '@react-native-community/async-storage'
export const DATA_PLACES = 'DATA_PLACES'

export const setCurrentPosition = (position) => {
  let promise = new Promise((resolve, reject) => {
    if(position.accuracy <= 100) {
      AsyncStorage.setItem('currentLocation', JSON.stringify(position), (error) => {
        if(!error) {
          resolve(position)
        } else {
          reject(error)
        }
      })
    } else {
      reject({status: 'error'})
    }
  })

  return promise
}

export const getCurrentPosition = () => {
  let promise = new Promise((resolve, reject) => {
    AsyncStorage.getItem('currentLocation', (error, result) => {
      if (!error) {
        if(result !== null) {
          result = JSON.parse(result)
          resolve(result)
        } else {
          reject(error)
        }
      } else {
        reject(error)
      }
    })
  })

  return promise
}

export const getDataPlaces = (latLng, keyword) => {
  return new Promise((resolve, reject) => {
    fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latLng}&keyword=${encodeURI(keyword)}&language=id&rankby=distance&key=AIzaSyAxhYU3ruCgYwymJKQ7MtdhCXLtuWweWc0`)
      .then(res => res.json())
      .then(places => {
        resolve(places)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const dataPlaces = (data) => {
  return (dispatch) => {
    dispatch({
      type: DATA_PLACES,
      payload: data
    })
  }
}

export const getDistanceMatrix = (origin, destination) => {
  return new Promise((resolve, reject) => {
    fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&mode=driving&key=AIzaSyAxhYU3ruCgYwymJKQ7MtdhCXLtuWweWc0`)
      .then(res => res.json())
      .then(resolve)
      .catch(reject)
  })
}

export const getDirections = (origin, destination) => {
  return new Promise((resolve, reject) => {
    fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=AIzaSyAxhYU3ruCgYwymJKQ7MtdhCXLtuWweWc0`)
      .then(res => res.json())
      .then(resolve)
      .catch(reject)
  })
}