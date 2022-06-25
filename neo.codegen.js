
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
}

const rx_minus_point = /[\-.]/g;

function numgle(number) {

// We make big decimal literals look as natural as possible by making them into
// constants. A constant name start with '$'. A '-' or '.' is replaced with '_'.

//  So, '1' becomes '$1', '98.6' becomes '$98_6', and '-1.011e-5' becomes
//  '$_1_011e_5'.

    const text = big_float.string(number.number);
    const name = "$" + text.replace(rx_minus_point, "_");
    if (unique[name] !== true) {
        unique[name] = true;
        front_matter.push(
            "const " + name + " = $NEO.number(\"" + text + "\");\n"
        );
    }
    return name;
}

function op(thing) {
    const transform = operator_transform[thing.id];
    return (
        typeof transform === "string"
        ? (
            thing.zeroth === undefined
            ? transform
            : transform + "(" + expression(thing.zeroth) + (
                thing.wunth === undefined
                ? ""
                : ", " + expression(thing.wunth)
            ) + ")"
        )
        : transform(thing)
    );

}

function expression(thing) {
    if (thing.id === "(number)") {
        return numgle(thing);
    }
    if (thing.id === "(text)") {
        return JSON.stringify(thing.text);
    }
    if (thing.alphameric) {
        return (
            thing.origin === undefined
            ? primordial[thing.id]
            : mangle(thing.id)
        );
    }
    return op(thing);
}

function array_literal(array) {
    return "[" + array.map(function (element) {
        return (
            Array.isArray(element)
            ? array_literal(element)
            : expression(element)
        );
    }).join(", ") + "]";
}

function record_literal(array) {
    indent();
    const padding = begin();
    const string = "(function (o) {" + array.map(function (element) {
        return padding + (
            typeof element.zeroth === "string"
            ? (
                "o["
                + JSON.stringify(element.zeroth)
                + "] = "