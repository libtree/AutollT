// include.js
// 2018-09-26

const rx_include = /@include\u0020"([^"@]+)"/;

//. Capturing groups:
//.  [0] The whole '@include' expression
//.  [1] The key

export default Object.freeze(function include(
    callback,
    string,
    get_inclusion,
    max_depth = 4
) {

// The 'include' function replaces '@include' expressions in a string with
// other strings. If there are no '@include' expressions, then the original
// string is the result.

// The 'include' function takes these parameters:

//       callback(result)
//           The 'callback' function is given the processed 'result' string.

//       string
//           A string that may contain zero or more '@include' expressions.

//                       @include "key"

//           There is a space between the '@include' and the opening of the
//           key. Each '@include' expression is replaced with the inclusion
//           associated with the key if possible. A key (which could be a
//           filename) is w