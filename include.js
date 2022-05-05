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
// string is the result