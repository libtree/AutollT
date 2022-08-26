// big_integer.js
// Douglas Crockford
// 2019-02-09

// You can access the big integer object in your module by importing it.
//      import big_integer from "./big_integer.js";

/*jslint bitwise */

/*property
    abs, abs_lt, add, and, clz32, concat, create, div, divrem, eq, every, fill,
    floor, forEach, freeze, gcd, isArray, isInteger, isSafeInteger,
    is_big_integer, is_negative, is_positive, is_zero, join, length, lt, make,
    map, mask, mul, neg, not, number, or, population, power, push, random,
    reduce, reverse, shift_down, shift_up, significant_bits, signum, slice,
    split, string, sub, ten, toUpperCase, two, wun, xor, zero
*/

const radix = 16777216;
const radix_squared = radix * radix;
const log2_radix = 24;
const plus = "+";
const minus = "-";
const sign = 0;
const least = 1;

function last(array) {
    return array[array.length - 1];
}

function next_to_last(array) {
    return array[array.length - 2];
}

const zero = Object.freeze([plus]);
const wun = Object.freeze([plus, 1]);
const two = Object.freeze([plus, 2]);
const ten = Object.freeze([plus, 10]);
const