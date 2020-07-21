const getImageThumb = (file, size) => {
  switch (size) {
    case 'lg':
      size = 'large';
      break;
    case 'md':
      size = 'medium';
      break;
    case 'sm':
      size = 'small';
      break;
    case 'xs':
      size = 'xsmall';
      break;
    case 'xxs':
      size = 'xxsmall';
      break;
  }

  file = file.split('/')
  indexEnd = file.length - 1
  file[indexEnd] = size + '-' + file[indexEnd]
  thumb = ''
  for(let i = 0;i<file.length;i++) {
    thumb += file[i] + (indexEnd === i ? '' : '/')
  }

  return thumb
}

export default getImageThumb