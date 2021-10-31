// big_rational.js
// Douglas Crockford
// 2018-11-05

// You can access the big rational object in your module by importing it.
//      import big_rational from "./big_rational.js";

/*jslint bitwise */

/*property
    abs, abs_lt, add, coefficient, create, dec, demoninator, denominator, div,
    divrem, eq, exponent, fraction, freeze, gcd, inc, integer, isFinite,
    isSafeInteger, is_big_integer, is_big_rational, is_integer, is_negative,
    is_zero, length, lt, make, match, mul, neg, normalize, number, numerator,
    padStart, power, reciprocal, remainder, sign, string, sub, ten, two, wun,
    zero
*/

import big_integer from "./big_integer.js";

function is_big_rational(a) {
    return (
        typeof a === "object"
        && big_integer.is_big_integer(a.numerator)
        && big_integer.is_big_integer(a.denominator)
    );
}

function is_integer(a) {
    return (
        big_integer.eq(big_integer.wun, a.denomin