
// neo.parse.js
// Douglas Crockford
// 2022-07-29

// Public Domain

/*jslint devel */

/*property
    alphameric, break, call, class, column_nr, column_to, concat, create, def,
    disrupt, fail, forEach, freeze, id, if, indexOf, length, let, line_nr, loop,
    origin, parent, parser, pop, precedence, push, readonly, return, scope,
    slice, startsWith, text, twoth, var, wunth, zeroth
*/

let the_error;

function error(zeroth, wunth) {
    the_error = {
        id: "(error)",
        zeroth,
        wunth
    };
    throw "fail";
}

const primordial = (function (ids) {
    const result = Object.create(null);
    ids.forEach(function (id) {
        result[id] = Object.freeze({
            id,
            alphameric: true,
            readonly: true
        });
    });
    return Object.freeze(result);
}([
    "abs", "array", "array?", "bit and", "bit mask", "bit or", "bit shift down",
    "bit shift up", "bit xor", "boolean?", "char", "code", "false", "fraction",
    "function?", "integer", "integer?", "length", "neg", "not", "number",
    "number?", "null", "record", "record?", "stone", "stone?", "text", "text?",
    "true"
]));

// The generator function supplies a stream of token objects.
// Three tokens are visible as 'prev_token', 'token', and 'next_token'.
// The 'advance' function uses the generator to cycle thru all of
// the token objects, skipping over the comments.

let the_token_generator;
let prev_token;
let token;
let next_token;

let now_function;       // The function currently being processed.
let loop;               // An array of loop exit status.

const the_end = Object.freeze({
    id: "(end)",
    precedence: 0,
    column_nr: 0,
    column_to: 0,
    line_nr: 0
});


function advance(id) {

// Advance to the next token using the token generator.
// If an 'id' is supplied, make sure that the current token matches that 'id'.

    if (id !== undefined && id !== token.id) {
        return error(token, "expected '" + id + "'");
    }
    prev_token = token;
    token = next_token;
    next_token = the_token_generator() || the_end;
}

function prelude() {

// If 'token' contains a space, split it, putting the first part in
// 'prev_token'. Otherwise, advance.

    if (token.alphameric) {
        let space_at = token.id.indexOf(" ");
        if (space_at > 0) {
            prev_token = {
                id: token.id.slice(0, space_at),
                alphameric: true,
                line_nr: token.line_nr,
                column_nr: token.column_nr,
                column_to: token.column_nr + space_at
            };
            token.id = token.id.slice(space_at + 1);
            token.column_nr = token.column_nr + space_at + 1;
            return;
        }
    }
    return advance();
}

let indentation;

function indent() {
    indentation += 4;
}

function outdent() {
    indentation -= 4;
}

function at_indentation() {
    if (token.column_nr !== indentation) {
        return error(token, "expected at " + indentation);
    }
}

function is_line_break() {
    return token.line_nr !== prev_token.line_nr;
}

function same_line() {
    if (is_line_break()) {
        return error(token, "unexpected linebreak");
    }
}

function line_check(open) {