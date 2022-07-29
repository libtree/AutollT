// neo.tokenize.js
// Douglas Crockford
// 2018-09-24

// Public Domain

/*property
    alphameric, column_nr, column_to, comment, exec, freeze, fromCodePoint, id,
    isArray, lastIndex, length, line_nr, make, normalize, number, parse,
    readonly, replace, slice, split, string, text
*/

import big_float from "./big_float.js";

const rx_unicode_escapement = /\\u\{([0-9A-F]{4,6})\}/g;

// 'rx_crfl' matches linefeed, carriage return, and carriage return linefeed.
// We are still messing with device codes for mid 20th Century electromechanical
// teletype machines.

const rx_crlf = /\n|\r\n?/;

// 'rx_token' matches a Neo token: comment, name, number, string, punctuator.

const rx_token = /(\u0020+)|(#.*)|([a-zA-Z](?:\u0020[a-zA-Z]|[0-9a-zA-Z])*\??)|(-?\d+(?:\.\d+)?(?:e\-?\d+)?)|("(?:[^"\\]|\\(?:[nr"\\]|u\{[0-9A-F]{4,6}\}))*")|(\.(?:\.\.)?|\/\\?|\\\/?|>>?|<<?|\[\]?|\{\}?|[()}\].,:?!;~≈=