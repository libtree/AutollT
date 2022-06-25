
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

const reserved = make_set([
    "arguments", "await", "break", "case", "catch", "class", "const",
    "continue", "debugger", "default", "delete", "do", "else", "enum", "eval",
    "export", "extends", "false", "finally", "for", "function", "if",
    "implements", "import", "in", "Infinity", "instanceof", "interface", "let",
    "NaN", "new", "null", "package", "private", "protected", "public", "return",
    "static", "super", "switch", "this", "throw", "true", "try", "typeof",
    "undefined", "var", "void", "while", "with", "yield"
]);

const primordial = $NEO.stone({
    "abs": "$NEO.abs",
    "array": "$NEO.array",
    "array?": "Array.isArray",
    "bit and": "$NEO.bitand",
    "bit mask": "$NEO.bitmask",
    "bit or": "$NEO.bitor",
    "bit shift down": "$NEO.bitdown",
    "bit shift up": "$NEO.bitup",
    "bit xor": "$NEO.bitxor",
    "boolean?": "$NEO.boolean_",
    "char": "$NEO.char",
    "code": "$NEO.code",
    "false": "false",
    "fraction": "$NEO.fraction",
    "function?": "$NEO.function_",
    "integer": "$NEO.integer",
    "integer?": "$NEO.integer_",
    "length": "$NEO.length",
    "neg": "$NEO.neg",
    "not": "$NEO.not",
    "null": "undefined",
    "number": "$NEO.make",
    "number?": "$NEO.is_big_float",
    "record": "$NEO.record",
    "record?": "$NEO.record_",
    "stone": "$NEO.stone",
    "stone?": "Object.isFrozen",
    "text": "$NEO.text",
    "text?": "$NEO.text_",
    "true": "true"
});

let indentation;

function indent() {
    indentation += 4;
}

function outdent() {
    indentation -= 4;
}

function begin() {

// At the beginning of each line we emit a line break and padding.

    return "\n" + " ".repeat(indentation);
}

let front_matter;
let operator_transform;
let statement_transform;
let unique;

const rx_space_question = /[\u0020?]/g;

function mangle(name) {

// JavaScript does not allow space or '?' in identifiers, so we
// replace them with '_'. We give reserved words a '$' prefix.

//  So 'what me worry?' becomes 'what_me_worry_', and 'class' becomes '$class'.

    return (
        reserved[name] === true
        ? "$" + name
        : name.replace(rx_space_question, "_")
    );