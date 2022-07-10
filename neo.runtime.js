
// neo.runtime.js
// Douglas Crockford
// 2022-07-29

/*property
    abs, add, and, array, assert_boolean, assign, bitand, bitdown, bitmask,
    bitor, bitup, bitxor, boolean_, cat, cats, char, code, codePointAt,
    coefficient, create, default, delete, div, eq, exponent, fail, fill,
    forEach, fraction, freeze, fromCodePoint, function_, ge, get, gt, integer,
    integer_, isArray, isFrozen, isSafeInteger, is_big_float, join, keys, le,
    length, lt, make, map, mask, max, min, mul, ne, neg, normalize, not, number,
    number_, or, push, record, record_, reduce, resolve, set, shift_down,
    shift_up, slice, split, stone, string, sub, ternary, text, text_, wun, xor
*/

import big_float from "./big_float.js";
import big_integer from "./big_integer.js";

function fail(what = "fail") {
    throw new Error(what);
}

let weakmap_of_weakmaps = new WeakMap();

function get(container, key) {
    try {