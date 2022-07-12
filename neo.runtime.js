
// neo.runtime.js
// Douglas Crockford
// 2022-07-29

/*property
    abs, add, and, array, assert_boolean, assign, bitand, bitdown, bitmask,
    bitor, bitup, bitxor, boolean_, cat, cats, char, code, codePointAt,
    coefficient, create, default, delete, div, eq, exponent, fail, fill,
    forEach, fraction, freeze, fromCodePoint, function_, ge, get, gt, integer,
    integer_, isArray, isFrozen, isSafeInteger, is_big_float, join, keys, le,
    length, lt, make, map, mask, max, min, mul, ne, neg, normalize, not, number,
    number_, or, push, record, record_, reduce, resolve, set, shift_down,
    shift_up, slice, split, stone, string, sub, ternary, text, text_, wun, xor
*/

import big_float from "./big_float.js";
import big_integer from "./big_integer.js";

function fail(what = "fail") {
    throw new Error(what);
}

let weakmap_of_weakmaps = new WeakMap();

function get(container, key) {
    try {
        if (Array.isArray(container) || typeof container === "string") {
            const element_nr = big_float.number(key);
            return (
                Number.isSafeInteger(element_nr)
                ? container[(
                    element_nr >= 0
                    ? element_nr
                    : container.length + element_nr
                )]
                : undefined
            );
        }
        if (typeof container === "object") {
            if (big_float.is_big_float(key)) {
                key = big_float.string(key);
            }
            return (
                typeof key === "string"
                ? container[key]
                : weakmap_of_weakmaps.get(container).get(key)
            );
        }
        if (typeof container === "function") {
            return function (...rest) {
                return container(key, rest);
            };
        }
    } catch (ignore) {
    }
}

function set(container, key, value) {
    if (Object.isFrozen(container)) {
        return fail("set");
    }
    if (Array.isArray(container)) {

// Arrays use only big float for keys.

        let element_nr = big_float.number(key);
        if (!Number.isSafeInteger(element_nr)) {
            return fail("set");
        }

// Negative indexes are aliases, so that '[-1]' sets the last element.

        if (element_nr < 0) {
            element_nr = container.length + element_nr;
        }

// The key must be in the allocated range of the array.

        if (element_nr < 0 || element_nr >= container.length) {
            return fail("set");
        }
        container[element_nr] = value;
    } else {
        if (big_float.is_big_float(key)) {
            key = big_float.string(key);
        }

// If the key is a string, then it is an object update.

        if (typeof key === "string") {
            if (value === undefined) {
                delete container[key];
            } else {
                container[key] = value;
            }
        } else {

// Otherwise, this is a weakmap update.
// There will be a weakmap associated with each record with object keys.
// Note that 'typeof key !== "object"' is 'false' when 'key' is an array.

            if (typeof key !== "object") {
                return fail("set");
            }
            let weakmap = weakmap_of_weakmaps.get(container);

// If there is not yet a weakmap associated with this container, then make wun.

            if (weakmap === undefined) {
                if (value === undefined) {
                    return;
                }
                weakmap = new WeakMap();
                weakmap_of_weakmaps.set(container, weakmap);
            }

// Update the weakmap.

            if (value === undefined) {
                weakmap.delete(key);
            } else {
                weakmap.set(key, value);
            }
        }
    }
}

function array(zeroth, wunth, twoth) {

// The 'array' function does the work of 'new Array', array'.fill',
// array'.slice', 'Object.keys', string'.split', and more.

    if (big_float.is_big_float(zeroth)) {
        const dimension = big_float.number(zeroth);
        if (!Number.isSafeInteger(dimension) || dimension < 0) {
            return fail("array");
        }
        let newness = new Array(dimension);
        return (
            (wunth === undefined || dimension === 0)
            ? newness
            : (
                typeof wunth === "function"
                ? newness.fill().map(wunth)
                : newness.fill(wunth)
            )
        );
    }
    if (Array.isArray(zeroth)) {
        if (typeof wunth === "function") {
            return zeroth.map(wunth);
        }
        return zeroth.slice(big_float.number(wunth), big_float.number(twoth));
    }
    if (typeof zeroth === "object") {
        return Object.keys(zeroth);
    }
    if (typeof zeroth === "string") {
        return zeroth.split(wunth || "");
    }
    return fail("array");
}

function number(a, b) {
    return (
        typeof a === "string"
        ? big_float.make(a, b)
        : (
            typeof a === "boolean"
            ? big_float.make(Number(a))
            : (
                big_float.is_big_float(a)
                ? a
                : undefined
            )
        )
    );
}

function record(zeroth, wunth) {
    const newness = Object.create(null);
    if (zeroth === undefined) {
        return newness;
    }
    if (Array.isArray(zeroth)) {
        if (wunth === undefined) {
            wunth = true;
        }
        zeroth.forEach(function (element, element_nr) {