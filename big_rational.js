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
        big_integer.eq(big_integer.wun, a.denominator)
        || big_integer.is_zero(
            big_integer.divrem(a.numerator, a.denominator)[1]
        )
    );
}

function is_negative(a) {
    return big_integer.is_negative(a.numerator);
}

function make_big_rational(numerator, denominator) {
    const new_big_rational = Object.create(null);
    new_big_rational.numerator = numerator;
    new_big_rational.denominator = denominator;
    return Object.freeze(new_big_rational);
}
const zero = make_big_rational(big_integer.zero, big_integer.wun);
const wun = make_big_rational(big_integer.wun, big_integer.wun);
const two = make_big_rational(big_integer.two, big_integer.wun);

function normalize(a) {

// Normalize a big rational by dividing the two components by their greatest
// common divisor. If their gcd is '1', then the number was already normalized.

    let {numerator, denominator} = a;
    if (big_integer.eq(big_integer.wun, denominator)) {
        return a;
    }
    let g_c_d = big_integer.gcd(numerator, denominator);
    return (
        big_integer.eq(big_integer.wun, g_c_d)
        ? a
        : make(
            big_integer.div(numerator, g_c_d),
            big_integer.div(denominator, g_c_d)
        )
    );
}

function deconstruct(number) {

// This function deconstructs a number, reducing it to its components:
// a sign, an integer coefficient, and an exponent, such that

//  '      number = sign * coefficient * (2 ** exponent)'

    let sign = 1;
    let coefficient = number;
    let exponent = 0;

// Remove the sign from the coefficient.

    if (coefficient < 0) {
        coefficient = -coefficient;
        sign = -1;
    }

    if (Number.isFinite(number) && number !== 0) {

// Reduce the coefficient: We can obtain the exponent by dividing the number by
// two until it goes to zero. We add the number of divisions to -1128, which is
// the exponent of 'Number.MIN_VALUE' minus the number of bits in the
// significand minus the bonus bit.

        exponent = -1128;
        let reduction = coefficient;
        while (reduction !== 0) {

// This loop is guaranteed to reach zero. Each division will decrement the
// exponent of the reduction. When the exponent is so small that it can not
// be decremented, then the internal subnormal significand will be shifted
// right instead. Ultimately, all of the bits will be shifted out.

            exponent += 1;
            reduction /= 2;
        }

// Reduce the exponent: When the exponent is zero, the number can be viewed
// as an integer. If the exponent is not zero, then adjust to correct the
// coefficient.

        reduction = exponent;
        while (reduction > 0) {
            coefficient /= 2;
            reduction -= 1;
        }
        while (reduction < 0) {
            coefficient *= 2;
            reduction += 1;
        }
    }

// Return an object containing the three components and the original number.

    return {
        sign,
        coefficient,
        exponent,
        number
    };
}

const number_pattern = /^(-?)(?:(\d+)(?:(?:\u0020(\d+))?\/(\d+)|(?:\.(\d*))?(?:e(-?\d+))?)|\.(\d+))$/;

function make(numerator, denominator) {

// If there are two arguments, both will be converted to big integers.
// The return value is an object containing the numerator and the
// denominator.

// If called with 1 argument, we will try to make sense of that
// argument. If the argument is a string, we will try to parse it
// as a mixed fraction or as a decimal literal. If the argument is
// a number, we will deconstruct it. Otherwise, we will assume that the
// missing argument was a 1.

    if (denominator !== undefined) {

// Make a rational number from a numerator and a denominator. You may
// pass in big integers, integers, or strings.

        numerator = big_integer.make(numerator);

// If the numerator is zero, we do not care about the denominator.

        if (big_integer.zero === numerator) {
            return zero;
        }
        denominator = big_integer.make(denominator);
        if (
            !big_integer.is_big_integer(numerator)
            || !big_integer.is_big_integer(denominator)
            || big_integer.zero === denominator
        ) {
            return undefined;
        }

// If the denominator is negative, move the sign to the numerator.

        if (big_integer.is_negative(denominator)) {
            numerator = big_integer.neg(numerator);
            denominator = big_integer.abs(denominator);
        }
        return make_big_rational(numerator, denominator);
    }

// Is the argument a string? If so, try to parse it.

    if (typeof numerator === "string") {
        let parts = numerator.match(number_pattern);
        if (!parts) {
            return undefined;
        }

//. Capturing groups:
//.     [1] sign
//.     [2] integer
//.     [3] top
//.     [4] bottom
//.     [5] frac
//.     [6] exp
//.     [7] naked frac

        if (parts[7]) {
            return make(
                big_integer.make(p