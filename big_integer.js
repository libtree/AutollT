// big_integer.js
// Douglas Crockford
// 2023-02-12

// You can access the big integer object in your module by importing it.
//      import big_integer from "./big_integer.js";

/*jslint bitwise, for */

/*property
    abs, abs_lt, add, and, asIntN, asUintN, clz32, create, div, divrem, eq,
    forEach, freeze, gcd, isInteger, isSafeInteger, is_big_integer, is_negative,
    is_positive, is_zero, join, lt, make, mask, mul, neg, not, number, or,
    population, power, push, random, rem, repeat, reverse, shift_down, shift_up,
    significant_bits, signum, split, string, sub, ten, toUpperCase, two, wun,
    xor, zero
*/

// big_integer was made for my book /How JavaScript Works/. Since publication,
// JavaScript has acquired BigInt. The BigInt provides a significant speed
// improvement. This file is a rewrite of the original big_integer using
// BigInt.

// big_integer is used by big_float and big_rational.

const zero = 0n;
const wun = 1n;
const two = 2n;
const ten = 10n;
const thirty_two = 32n;
const negative_wun = -1n;

function is_big_integer(big) {
    return typeof big === "bigint";
}

function is_negative(big) {
    return big < zero;
}

function is_positive(