
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

function is_zero(big) {
    return big_integer.is_zero(big.coefficient);
}

const zero = Object.create(null);
zero.coefficient = big_integer.zero;
zero.exponent = 0;
Object.freeze(zero);

function make_big_float(coefficient, exponent) {
    if (big_integer.is_zero(coefficient)) {
        return zero;
    }
    const new_big_float = Object.create(null);
    new_big_float.coefficient = coefficient;
    new_big_float.exponent = exponent;
    return Object.freeze(new_big_float);
}

const big_integer_ten_million = big_integer.make(10000000);

function number(a) {
    const result = (
        is_big_float(a)
        ? (
            a.exponent === 0
            ? big_integer.number(a.coefficient)
            : big_integer.number(a.coefficient) * (10 ** a.exponent)
        )
        : (
            typeof a === "number"
            ? a
            : (
                big_integer.is_big_integer(a)
                ? big_integer.number(a)
                : Number(a)
            )
        )
    );
    return (
        Number.isFinite(result)
        ? result
        : undefined
    );
}

function neg(a) {
    return make_big_float(big_integer.neg(a.coefficient), a.exponent);
}

function abs(a) {
    return (
        is_negative(a)
        ? neg(a)
        : a
    );
}

function conform_op(op) {
    return function (a, b) {
        const differential = a.exponent - b.exponent;
        return (
            differential === 0
            ? make_big_float(op(a.coefficient, b.coefficient), a.exponent)
            : (
                differential > 0
                ? make_big_float(
                    op(
                        big_integer.mul(
                            a.coefficient,
                            big_integer.power(big_integer.ten, differential)
                        ),
                        b.coefficient
                    ),
                    b.exponent
                )
                : make_big_float(
                    op(
                        a.coefficient,
                        big_integer.mul(
                            b.coefficient,
                            big_integer.power(big_integer.ten, -differential)
                        )
                    ),
                    a.exponent
                )
            )
        );
    };
}

const add = conform_op(big_integer.add);
const sub = conform_op(big_integer.sub);

function eq(comparahend, comparator) {
    return comparahend === comparator || is_zero(sub(comparahend, comparator));