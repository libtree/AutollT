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

// big_integer was made for my book /How JavaScript Works/. Since