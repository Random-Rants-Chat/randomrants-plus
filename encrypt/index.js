var {atob, btoa} = require("./base64.js");

var accountEncrypt = {};
var encryptList =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890=-+)(*&^%$#@!`~'\">.<,/?\\]}[{";
var numberToChar = {
  1: "a",
  2: "2",
  3: "b",
  4: "1",
  5: "y",
  6: "3",
  7: "9",
  8: "i",
  9: "5",
  0: "r",
  e: "3",
  ".": "7",
  split: "0",
};

function toFourDigitsString(digit) {
  return digit.toLocaleString("en-US", {
    minimumIntegerDigits: 4,
    useGrouping: false,
  });
}

function toEncryptedNumber(numbers) {
  var num = numbers.toString();
  var tmp = "";
  for (var number of num) {
    tmp += numberToChar[number];
  }
  return tmp;
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function fromEncryptedNumber(txt) {
  var num = "";
  for (var character of txt) {
    num += getKeyByValue(numberToChar, character);
  }
  return Number(num);
}

accountEncrypt.encrypt = function (json) {
  try {
    var string = JSON.stringify(json);
    var base = btoa(string);
    var outarray = [];
    var shift = Math.round(Math.random() * 10);
    outarray.push(toEncryptedNumber(shift));
    var i = 0;
    while (i < base.length) {
      var value = encryptList.indexOf(base[i]) + shift;

      outarray.push(toEncryptedNumber(value));
      i += 1;
    }
    return outarray.join(numberToChar.split);
  } catch (e) {
    return;
  }
};

accountEncrypt.decrypt = function (string) {
  try {
    var decrypted = {};
    var split = string.split(numberToChar.split);
    var chars = "";
    var shift = fromEncryptedNumber(split[0]);
    var base = "";
    for (var enumber of split.slice(1, split.length)) {
      var num = fromEncryptedNumber(enumber);
      base += encryptList[num - shift];
    }

    var raw = atob(base);
    var json = JSON.parse(raw);

    return json;
  } catch (e) {
    return;
  }
};

module.exports = accountEncrypt;

