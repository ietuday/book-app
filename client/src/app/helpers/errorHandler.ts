export function handleError(error: any): string {
  let messages = [];
  if(error.name === 'ValidationError') {
    for(let key in error.errors) {
      messages.push(error.errors[key].message);
    }

    return messages.join(' ');
  } else {
    return error.message;
  }
}
