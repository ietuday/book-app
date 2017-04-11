export function detectCardType(number: string) {
  const re = {
    maestro: /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/
  };

  for(var key in re) {
    if(re[key].test(number)) {
      return key;
    }
  }
}

export function formatPan(value) {
  var number = value.split(" ").join(""); // remove spaces
  if (number.length > 0) {
    number = number.match(new RegExp('.{1,4}', 'g')).join(" ");
  }
  return number;
}

export function correctNumber(number) {
  return number.split(" ").join("");
}
