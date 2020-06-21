let Color = {
  black: '#2f2f2f',
  white: '#fff',
  grayLighter: '#f5f5f5',
  grayLight: '#efefef',
  gray: '#7e7e7e',
  grayDark: '#353940',
  blue: '#394dbd',
  yellow: '#ffd71d',
  green: '#2c9e6d',
  purple: '#96339c',
  pink: '#bd3f9c',
  teal: '#24b4ce',
  cean: '#38d8ad',
  red: '#d23454'
}

Color = {
  ...Color,
  primary: Color.yellow,
  secondary: '#a78f27',
  textColor: Color.black,
  textMuted: '#8a8a8a',
  borderColor: '#eee',
  borderColorGray: '#ddd'
}

export default Color

export function colorYiq(hex) {
  var r = parseInt(hex.substr(1, 2), 16),
      g = parseInt(hex.substr(3, 2), 16),
      b = parseInt(hex.substr(5, 2), 16),
      yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 196) ? Color.black : Color.white;
}