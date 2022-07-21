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

// 'rx_crfl' matches linefeed, carriage return, and carriage return line