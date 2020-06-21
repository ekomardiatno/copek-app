export const getGeocoding = (position) => {
  return new Promise((resolve, reject) => {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.latitude},${position.longitude}&key=AIzaSyAxhYU3ruCgYwymJKQ7MtdhCXLtuWweWc0`)
      .then(result => result.json())
      .then(resolve)
      .catch(reject)
  })
}

export const getAddressComponents = (geocode) => {
  let address_components = geocode.results[0].address_components
  let title = ''
  if (address_components[0].types.indexOf('street_number') > -1) {
    let street_number = address_components[0].short_name
    street_number.toLowerCase().indexOf('no') < 0
    ? street_number = `No. ${street_number}`
    : street_number = street_number
    let route = address_components.filter(a => {
      return a.types.indexOf('route') > -1
    })
    title = `${route[0].short_name} ${street_number}`
  } else {
    title = address_components[0].short_name
  }

  return [title, geocode.results[0].formatted_address]
}