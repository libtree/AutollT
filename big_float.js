
// big_float.js
// Douglas Crockford
// 2019-06-28

// You can access the big decimal floating point object in your module
// by importing it.

//      import big_float from "./big_float.js";

//      big_float.eq(
//          big_float.add(
//              big_float.make("0.1"),
//              big_float.make("0.2")
//          ),
//          big_float.make("0.3")
//      )                           // true

/*jslint bitwise */

/*property
    abs, abs_lt, add, coefficient, create, div, divrem, eq, exponent, fraction,
    freeze, integer, isFinite, isSafeInteger, is_big_float, is_big_integer,
    is_negative, is_positive, is_zero, length, lt, make, match, mul, neg,
    normalize, number, power, repeat, scientific, sign, signum, slice, string,
    sub, ten, two, zero
*/

import big_integer from "./big_integer.js";

function is_big_float(big) {
    return (
        typeof big === "object"
        && big_integer.is_big_integer(big.coefficient)
        && Number.isSafeInteger(big.exponent)
    );
}

function is_negative(big) {
    return big_integer.is_negative(big.coefficient);
}

function is_positive(big) {
    return big_integer.is_positive(big.coefficient);
}