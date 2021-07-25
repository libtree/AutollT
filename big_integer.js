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

function is_positive(big) {
    return big >= zero;
}

function is_zero(big) {
    return big === zero;
}

function neg(big) {
    return -big;
}

function abs(big) {
    return (
        is_negative(big)
        ? neg(big)
        : big
    );
}

function signum(big) {
    return (
        is_zero(big)
        ? zero
        : (
            is_negative(big)
            ? negative_wun
            : wun
        )
    );
}

function eq(comparahend, comparator) {
    return comparahend === comparator;
}

function abs_lt(comparahend, comparator) {
    return abs(comparahend) < abs(comparator);
}

function lt(comparahend, comparator) {
    return comparahend < comparator;
}

function number(big) {
    return Number(String(big));
}

function and(a, b) {
    return a & b;
}

function or(a, b) {
    return a | b;
}

function xor(a, b) {
    return a ^ b;
}

function mask(nr_bits) {
    return BigInt.asUintN(number(nr_bits), negative_wun);
}

function not(a, nr_bits) {
    return (
        nr_bits === undefined
        ? ~a
        : xor(a, mask(nr_bits))
    );
}

function shift_up(big, places) {
    return big << BigInt(places);
}

function shift_down(big, places) {
    return big >> BigInt(places);
}

function random(nr_bits, random_source = Math.random) {
    let result = zero;
    while (nr_bits > 0) {
        result += result;
        if (random_source() >= 0.5) {
            result += wun;
        }
        nr_bits -= 1;
    }
    return result;
}

function add(augend, addend) {
    return augend + addend;
}

function sub(minuend, subtrahend) {
    return minuend - subtrahend;
}

function mul(multiplicand, multiplier) {
    if (is_zero(multiplicand) || is_zero(multiplier)) {
        return zero;
    }
    return multiplicand * multiplier;
}

function divrem(dividend, divisor) {
    if (is_zero(dividend)) {
        return [zero, zero];
    }
    if (is_zero(divisor)) {
        return undefined;
    }
    return [dividend / divisor, dividend % divisor];
}

function div(dividend, divisor) {
    if (is_zero(dividend)) {
        return zero;
    }
    if (is_zero(divisor)) {
        return undefined;
    }
    return dividend / divisor;
}

function rem(dividend, divisor) {
    if (is_zero(dividend)) {
        return zero;
    }
    if (is_zero(divisor)) {
        return undefined;
    }
    return dividend % divisor;
}

function power(big, exponent) {
    return big ** BigInt(exponent);
}

function gcd(a, b) {
    a = abs(a);
    b = abs(b);
    while (!is_zero(b)) {
        let remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}

const digitset = "0123456789ABCDEFGHJKMNPQRSTVWXYZ*~$=U";
const charset = (function (object) {
    digitset.split("").forEach(function (element, element_nr) {
        object[element] = element_nr;
    });
    return Object.freeze(object);
}(Object.create(null)));

function make(value, radix_2_37 = 10) {

// The 'make' function returns a big integer. The value parameter is
// a string and an optional radix, or an integer, or a big_integer.

    if (typeof value !== "string") {
        return BigInt(value);
    }
    radix_2_37 = number(radix_2_37);
    if (
        !Number.isInteger(radix_2_37)
        || radix_2_37 < 2
        || radix_2_37 > 37
    ) {
        return undefined;
    }
    if (radix_2_37 === 10) {
        return BigInt(value);
    }
    let radish = BigInt(radix_2_37);
    let good = false;
    let sign = wun;
    let result = zero;
    value.toUpperCase().split("").forEach(
        function (element, element_nr) {
            if (element_nr === 0) {
                if (element === "+") {
                    return;
                }
                if (element === "-") {
                    sign = negative_wun;
                    return;
                }
            }
            let digit = charset[element];
            if (digit !== undefined && digit < radix_2_37) {
                good = true;
                result = result * radish + BigInt(digit);
            }
            sign = undefined;
      