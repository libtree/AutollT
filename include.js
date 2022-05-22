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
//           filename) is wrapped in parens.

//       get_inclusion(callback, key)
//           Your 'get_inclusion' function takes a key string and eventually
//           passes the resulting inclusion string to 'callback('inclusion')'.
//           Your 'get_inclusion' function could access a file system,
//           database, source control system, content manager, or JSON Object.

//           If inclusions are coming from files, and if the environment is
//           Node.js, then your 'get_inclusion' function could look like this:

//           function my_little_get_inclusion(callback, key) {
//               return (
//                   (key[0] >= "a" && key[0] <= "z")
//                   ? fs.readFile(key, "utf8", function (ignore, data) {
//                       return callback(data);
//                   })
//                   : callback()
//               );
//           }


//       max_depth
//           An inclusion may contain more '@include' expressions. 'max_depth'
//           limits the depth to prevent infinite include loops.

// The 'include' function does not need direct access to or knowledge of
// the file system or the database or anything else because that capability
// is passed in as your 'get_inclusion' function. That makes the 'include'
// function versatile and trustworthy.

// Nothing is returned. The result is communicated eventually through the
// 'callback'.

    l