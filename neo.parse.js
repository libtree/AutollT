
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