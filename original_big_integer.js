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
const negative_wun = Object.freeze([minus, 1]);

function mint(proto_big_integer) {

// Mint a big integer number from a proto big integer. Delete leading zero
// megadigits. Substitute a popular constant if possible.

    while (last(proto_big_integer) === 0) {
        proto_big_integer.length -= 1;
    }
    if (proto_big_integer.length <= 1) {
        return zero;
    }
    if (proto_big_integer[sign] === plus) {
        if (proto_big_integer.length === 2) {
            if (proto_big_integer[least] === 1) {
                return wun;
            }
            if (proto_big_integer[least] === 2) {
                return two;
            }
            if (proto_big_integer[least] === 10) {
                return ten;
            }
        }
    } else if (proto_big_integer.length === 2) {
        if (proto_big_integer[least] === 1) {
            return negative_wun;
        }
    }
    return Object.freeze(proto_big_integer);
}

function is_big_integer(big) {
    return Array.isArray(big) && (big[sign] === plus || big[sign] === minus);
}

function is_negative(big) {
    return Array.isArray(big) && big[sign] === minus;
}

function is_positive(big) {
    return Array.isArray(big) && big[sign] === plus;
}

function is_zero(big) {
    return !Array.isArray(big) || big.length < 2;
}

function neg(big) {
    if (is_zero(big)) {
        return zero;
    }
    let negation = big.slice();
    negation[sign] = (
        is_negative(big)
        ? plus
        : minus
    );
    return mint(negation);
}

function abs(big) {
    return (
        is_zero(big)
        ? zero
        : (
            is_negative(big)
            ? neg(big)
            : big
        )
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
    return comparahend === comparator || (
        comparahend.length === comparator.length
        && comparahend.every(function (element, element_nr) {
            return element === comparator[element_nr];
        })
    );
}

function abs_lt(comparahend, comparator) {
    return (

// Ignoring the sign, the number with more megadigits is the larger.
// If the two numbers contain the same number of megadigits,
// then we must examine each pair.

        comparahend.length === comparator.length
        ? comparahend.reduce(
            function (reduction, element, element_nr) {
                if (element_nr !== sign) {
                    const other = comparator[element_nr];
                    if (element !== other) {
                        return element < other;
                    }
                }
                return reduction;
            },
            false
        )
        : comparahend.length < comparator.length
    );
}

function lt(comparahend, comparator) {
    return (
        comparahend[sign] !== comparator[sign]
        ? is_negative(comparahend)
        : (
            is_negative(comparahend)
            ? abs_lt(comparator, comparahend)
            : abs_lt(comparahend, comparator)
        )
    );
}

function int(big) {
    let result;
    if (typeof big === "number") {
        if (Number.isSafeInteger(big)) {
            return big;
        }
    } else if (is_big_integer(big)) {
        if (big.length < 2) {
            return 0;
        }
        if (big.length === 2) {
            return (
                is_negative(big)
                ? -big[least]
                : big[least]
            );
        }
        if (big.length === 3) {
            result = big[least + 1] * radix + big[least];
            return (
                is_negative(big)
                ? -result
                : result
            );
        }
        if (big.length === 4) {
            result = (
                big[least + 2] * radix_squared
                + big[least + 1] * radix
                + big[least]
            );
            if (Number.isSafeInteger(result)) {
                return (
                    is_negative(big)
                    ? -result
                    : result
                );
            }
        }
    }
}

function number(big) {
    let value = 0;
    let the_sign = 1;
    let factor = 1;
    big.forEach(function (element, element_nr) {
        if (element_nr === 0) {
            if (element === minus) {
                the_sign = -1;
            }
        } else {
            value += element * factor;
            factor *= radix;
        }
    });
    return the_sign * value;
}

function and(a, b) {

// Make 'a' the shorter array.

    if (a.length > b.length) {
        [a, b] = [b, a];
    }
    return mint(a.map(function (element, element_nr) {
        return (
            element_nr === sign
            ? plus
            : element & b[element_nr]
        );
    }));
}

function or(a, b) {

// Make 'a' the longer array.

    if (a.length < b.length) {
        [a, b] = [b, a];
    }
    return mint(a.map(function (element, element_nr) {
        return (
            element_nr === sign
            ? plus
            : element | (b[element_nr] || 0)
        );
    }));
}

function xor(a, b) {

// Make 'a' the longer array.

    if (a.length < b.length) {
        [a, b] = [b, a];
    }
    return mint(a.map(function (element, element_nr) {
        return (
            element_nr === sign
            ? plus
            : element ^ (b[element_nr] || 0)
        );
    }));
}

function mask(nr_bits) {

// Make a string of 1 bits.

    nr_bits = int(nr_bits);
    if (nr_bits !== undefined && nr_bits >= 0) {
        let mega = Math.floor(nr_bits / log2_radix);
        let result = new Array(mega + 1).fill(radix - 1);
        result[sign] = plus;
        let leftover = nr_bits - (mega * log2_radix);
        if (leftover > 0) {
            result.push((1 << leftover) - 1);
        }
        return mint(result);
    }
}

function not(a, nr_bits) {
    return xor(a, mask(nr_bits));
}

function shift_up(big, places) {
    if (is_zero(big)) {
        return zero;
    }
    places = int(places);
    if (Number.isSafeInteger(places)) {
        if (places === 0) {
            return abs(big);
        }
        if (places < 0) {
            return shift_down(big, -places);
        }
        let blanks = Math.floor(places / log2_radix);
        let result = new Array(blanks + 1).fill(0);
        result[sign] = plus;
        places -= blanks * log2_radix;
        if (places === 0) {
            return mint(result.concat(big.slice(least)));
        }
        let carry = big.reduce(function (accumulator, element, element_nr) {
            if (element_nr === sign) {
                return 0;
            }
            result.push(((element << places) | accumulator) & (radix - 1));
            return element >> (log2_radix - places);
        }, 0);
        if (carry > 0) {
            result.push(carry);
        }
        return mint(result);
    }
}

function shift_down(big, places) {
    if (is_zero(big)) {
        return zero;
    }
    places = int(places);
    if (Number.isSafeInteger(places)) {
        if (places === 0) {
            return abs(big);
        }
        if (places < 0) {
            return shift_up(big, -places);
        }
        let skip = Math.floor(places / log2_radix);
        places -= skip * log2_radix;
        if (skip + 1 >= big.length) {
            return zero;
        }
        big = (
            skip > 0
            ? mint(zero.concat(big.slice(skip + 1)))
            : big
        );
        if (places === 0) {
            return big;
        }
        return mint(big.map(function (element, element_nr) {
            if (element_nr === sign) {
                return plus;
            }
            return ((radix - 1) & (
                (element >> places)
                | ((big[element_nr + 1] || 0) << (log2_radix - places))
            ));
        }));
    }
}

function random(nr_bits, random = Math.random) {

// Make a string of random bits.