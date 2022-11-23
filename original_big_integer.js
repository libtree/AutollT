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

// Make a string of random bits. If you are concerned with security,
// you can pass in a stronger random number generator.

// First make a string of '1' bits.

    const wuns = mask(nr_bits);
    if (wuns !== undefined) {

// For each megadigit, get a random number between '0.0' and '1.0'.
// Take some upper bits and some lower bits and 'xor' them together.
// Then 'and' it to the megadigit and put it into the new number.

        return mint(wuns.map(function (element, element_nr) {
            if (element_nr === sign) {
                return plus;
            }
            const bits = random();
            return ((bits * radix_squared) ^ (bits * radix)) & element;
        }));
    }
}

function add(augend, addend) {
    if (is_zero(augend)) {
        return addend;
    }
    if (is_zero(addend)) {
        return augend;
    }

// If the signs are different, then turn this into a subtraction problem.

    if (augend[sign] !== addend[sign]) {
        return sub(augend, neg(addend));
    }

// The signs are the same. Add all the bits, giving the result the same sign.
// We can add numbers of different lengths. We give '.map' the longer wun,
// and use the '||' operator to replace nonexistant elements with zeros.

    if (augend.length < addend.length) {
        [addend, augend] = [augend, addend];
    }
    let carry = 0;
    let result = augend.map(function (element, element_nr) {
        if (element_nr !== sign) {
            element += (addend[element_nr] || 0) + carry;
            if (element >= radix) {
                carry = 1;
                element -= radix;
            } else {
                carry = 0;
            }
        }
        return element;
    });

// If the number overflowed, then append another element to contain the carry.

    if (carry > 0) {
        result.push(carry);
    }
    return mint(result);
}

function sub(minuend, subtrahend) {
    if (is_zero(subtrahend)) {
        return minuend;
    }
    if (is_zero(minuend)) {
        return neg(subtrahend);
    }
    let minuend_sign = minuend[sign];

// If the signs are different, turn this into an addition problem.

    if (minuend_sign !== subtrahend[sign]) {
        return add(minuend, neg(subtrahend));
    }

// Subtract the smaller from the larger.

    if (abs_lt(minuend, subtrahend)) {
        [subtrahend, minuend] = [minuend, subtrahend];
        minuend_sign = (
            minuend_sign === minus
            ? plus
            : minus
        );
    }
    let borrow = 0;
    return mint(minuend.map(function (element, element_nr) {
        if (element_nr === sign) {
            return minuend_sign;
        }
        let diff = element - ((subtrahend[element_nr] || 0) + borrow);
        if (diff < 0) {
            diff += 16777216;
            borrow = 1;
        } else {
            borrow = 0;
        }
        return diff;
    }));
}

function mul(multiplicand, multiplier) {
    if (is_zero(multiplicand) || is_zero(multiplier)) {
        return zero;
    }

// The sign of the result will be positive if the signs match.

    let result = [
        multiplicand[sign] === multiplier[sign]
        ? plus
        : minus
    ];

// Multiply each element of 'multiplicand' by each element of 'multiplier',
// propagating the carry.

    multiplicand.forEach(function (
        multiplicand_element,
        multiplicand_element_nr
    ) {
        if (multiplicand_element_nr !== sign) {
            let carry = 0;
            multiplier.forEach(function (
                multiplier_element,
                multiplier_element_nr
            ) {
                if (multiplier_element_nr !== sign) {
                    let at = (
                        multiplicand_element_nr + multiplier_element_nr - 1
                    );
                    let product = (
                        (multiplicand_element * multiplier_element)
                        + (result[at] || 0)
                        + carry
                    );
                    result[at] = product & 16777215;
                    carry = Math.floor(product / radix);
                }
            });
            if (carry > 0) {
                result[multiplicand_element_nr + multiplier.length - 1] = carry;
            }
        }
    });
    return mint(result);
}

function divrem(dividend, divisor) {
    if (is_zero(dividend) || abs_lt(dividend, divisor)) {
        return [zero, dividend];
    }
    if (is_zero(divisor)) {
        return undefined;
    }

// Make the operands positive.

    let quotient_is_negative = dividend[sign] !== divisor[sign];
    let remainder_is_negative = dividend[sign] === minus;
    let remainder = dividend;
    dividend = abs(dividend);
    divisor = abs(divisor);

// We do long division just like you did in school. We estimate the next
// digit of the quotient. We subtract the divisor times that estimate
// from the dividend, and then we go again. We are using base 16777216
// instead of base 10, and we are being more systematic in predicting
// the next digit of the quotent.

// In order to improve our predictions, we first mint the divisor. We shift it
// left until its most significant bit is '1'. We also shift the dividend by
// the same amount. See Algorithm 4.3.1D in 'The Art of Computer Programming'.

// To determine the shift count, we find the number of leading zero bits.
// The 'clz32' function counts in a field of 32 bits, but we are only
// concerned with a field of 24 bits, so we subtract 8.

    let shift = Math.clz32(last(divisor)) - 8;

    dividend = shift_up(dividend, shift);
    divisor = shift_up(divisor, shift);
    let place = dividend.length - divisor.length;
    let dividend_prefix = last(dividend);
    let divisor_prefix = last(divisor);
    if (dividend_prefix < divisor_prefix) {
        dividend_prefix = (dividend_prefix * radix) + next_to_last(dividend);
    } else {
        place += 1;
    }
    divisor = shift_up(divisor, (place - 1) * 24);
    let quotient = new Array(place + 1).fill(0);
    quotient[sign] = plus;
    while (true) {

// The estimate will not be too small, but it might be too large. If it is
// too large then subtracting the product of the estimate and the divisor
// from the dividend produces a negative. When that happens, make the
// estimate smaller and try again.

        let estimated = Math.floor(dividend_prefix / divisor_prefix);
        if (estimated > 0) {
            while (true) {
                let trial = sub(dividend, mul(divisor, [plus, estimated]));
                if (!is_negative(trial)) {
                    dividend = trial;
                    break;
                }
                estimated -= 1;
            }
        }

// The corrected estimate is stored in the 'quotient'.
// If that was the final place, then move on.

        quotient[place] = estimated;
        place -= 1;
        if (place === 0) {
            break;
        }

// Prepare for the next place. Update 'dividend_prefix' with the 