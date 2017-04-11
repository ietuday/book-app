export function convert(date) {
  const diff = Math.ceil((Date.now() - new Date(date).getTime())/60000);

  if(diff < 60) {
    return diff + ' minutes ago';
  }

  if(diff < 86400) {
    return Math.floor(diff / 60) + ' hours ago';
  }

  if(diff >= 86400) {
    return Math.floor(diff / 86400) + ' days ago';
  }
}
