/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
var charToIntMap = {};
var intToCharMap = {};

// using array instead of string.split to make IE happy (sigh)
var chars = [ 
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
];

for (var i = 0; i < chars.length; i++) {
  var ch = chars[i]
  charToIntMap[ch] = i;
  intToCharMap[i] = ch;
}

/**
  * Encode an integer in the range of 0 to 63 to a single base 64 digit.
  */
exports.encode = function base64_encode(aNumber) {
  if (aNumber in intToCharMap) {
    return intToCharMap[aNumber];
  }
  throw new TypeError("Must be between 0 and 63: " + aNumber);
};

/**
  * Decode a single base 64 digit to an integer.
  */
exports.decode = function base64_decode(aChar) {
  if (aChar in charToIntMap) {
    return charToIntMap[aChar];
  }
  throw new TypeError("Not a valid base 64 digit: " + aChar);
};
