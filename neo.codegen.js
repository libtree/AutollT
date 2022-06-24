
// neo.codegen.js
// Douglas Crockford
// 2022-07-29

/*property
    abs, alphameric, array, break, call, char, code, create, def, export, fail,
    false, forEach, fraction, id, if, import, integer, isArray, join, length,
    let, loop, map, neg, not, null, number, origin, push, record, repeat,
    replace, return, startsWith, stone, string, stringify, text, true, twoth,
    var, wunth, zeroth
*/

import big_float from "./big_float.js";
import $NEO from "./neo.runtime.js";

function make_set(array, value = true) {
    const object = Object.create(null);
    array.forEach(function (element) {
        object[element] = value;
    });
    return $NEO.stone(object);
}

const boolean_operator = make_set([
    "array?", "boolean?", "function?", "integer?", "not", "number?", "record?",
    "stone?", "text?", "true", "=", "≠", "<", ">", "≤", "≥", "/\\", "\\/"
]);