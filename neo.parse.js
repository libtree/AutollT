
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
    return (
        open
        ? at_indentation()
        : same_line()
    );
}

function register(the_token, readonly = false) {

// Add a variable to the current scope.

    if (now_function.scope[the_token.id] !== undefined) {
        error(the_token, "already defined");
    }
    the_token.readonly = readonly;
    the_token.origin = now_function;
    now_function.scope[the_token.id] = the_token;
}

function lookup(id) {

// Look for the definition in the current scope.

    let definition = now_function.scope[id];

// If that fails, search the ancestor scopes.

    if (definition === undefined) {
        let parent = now_function.parent;
        while (parent !== undefined) {
            definition = parent.scope[id];
            if (definition !== undefined) {
                break;
            }
            parent = parent.parent;
        }

// If that fails, search the primordials.

        if (definition === undefined) {
            definition = primordial[id];
        }

// Remember that the current function used this definition.

        if (definition !== undefined) {
            now_function.scope[id] = definition;
        }
    }
    return definition;
}

// The 'parse_statement', 'parse_prefix', and 'parse_suffix' objects
// contain functions that do the specialized parsing. We are using
// 'Object.create(null)' to make them because we do not want any of
// the debris from 'Object.prototype' getting dredged up here.

const parse_statement = Object.create(null);
const parse_prefix = Object.create(null);
const parse_suffix = Object.create(null);

function argument_expression(precedence = 0, open = false) {

// The expression function is the heart of this parser.
// It uses a technique called Top Down Operator Precedence.

// It takes an optional 'open' parameter that allows tolerance of
// certain line breaks. If 'open' is true, we expect the token to
// be at the indentation point.

    let definition;
    let left;
    let the_token = token;

// Is the token a number literal or text literal?

    if (the_token.id === "(number)" || the_token.id === "(text)") {
        advance();
        left = the_token;

// Is the token alphameric?

    } else if (the_token.alphameric === true) {
        definition = lookup(the_token.id);
        if (definition === undefined) {
            return error(the_token, "expected a variable");
        }
        left = definition;
        advance();
    } else {

// The token might be a prefix thing: '(', '[', '{', 'ƒ'.

        definition = parse_prefix[the_token.id];
        if (definition === undefined) {
            return error(the_token, "expected a variable");
        }
        advance();
        left = definition.parser(the_token);
    }

// We have the left part. Is there a suffix operator on the right?
// Does precedence allow consuming that operator?
// If so, combine the left and right to form a new left.

    while (true) {
        the_token = token;
        definition = parse_suffix[the_token.id];
        if (
            token.column_nr < indentation
            || (!open && is_line_break())
            || definition === undefined
            || definition.precedence <= precedence
        ) {
            break;
        }
        line_check(open && is_line_break());
        advance();
        the_token.class = "suffix";
        left = definition.parser(left, the_token);
    }

// After going zero or more times around the loop,
// we can return the parse tree of the expression.

    return left;
}

function expression(precedence, open = false) {

// Expressions do a whitespace check that argument expressions do not need.

    line_check(open);
    return argument_expression(precedence, open);
}

function statements() {
    const statement_list = [];
    let the_statement;
    while (true) {
        if (
            token === the_end
            || token.column_nr < indentation
            || token.alphameric !== true
            || token.id.startsWith("export")
        ) {
            break;
        }
        at_indentation();
        prelude();
        let parser = parse_statement[prev_token.id];
        if (parser === undefined) {
            return error(prev_token, "expected a statement");
        }
        prev_token.class = "statement";
        the_statement = parser(prev_token);
        statement_list.push(the_statement);
        if (the_statement.disrupt === true) {
            if (token.column_nr === indentation) {
                return error(token, "unreachable");
            }
            break;
        }
    }
    if (statement_list.length === 0) {
        if (!token.id.startsWith("export")) {
            return error(token, "expected a statement");
        }
    } else {
        statement_list.disrupt = the_statement.disrupt;
        statement_list.return = the_statement.return;
    }
    return statement_list;
}

function parse_dot(left, the_dot) {

// The expression on the left must be a variable or an expression
// that can return an object (excluding object literals).

    if (
        !left.alphameric
        && left.id !== "."
        && (left.id !== "[" || left.wunth === undefined)
        && left.id !== "("
    ) {
        return error(token, "expected a variable");
    }
    let the_name = token;
    if (the_name.alphameric !== true) {
        return error(the_name, "expected a field name");
    }
    the_dot.zeroth = left;
    the_dot.wunth = the_name;
    same_line();
    advance();
    return the_dot;
}

function parse_subscript(left, the_bracket) {
    if (
        !left.alphameric
        && left.id !== "."
        && (left.id !== "[" || left.wunth === undefined)
        && left.id !== "("
    ) {
        return error(token, "expected a variable");
    }
    the_bracket.zeroth = left;
    if (is_line_break()) {
        indent();
        the_bracket.wunth = expression(0, true);
        outdent();
        at_indentation();
    } else {
        the_bracket.wunth = expression();
        same_line();
    }
    advance("]");
    return the_bracket;
}

function ellipsis(left) {
    if (token.id === "...") {
        const the_ellipsis = token;
        same_line();
        advance("...");
        the_ellipsis.zeroth = left;
        return the_ellipsis;
    }
    return left;
}

function parse_invocation(left, the_paren) {

//. function invocation:
//.      expression
//.      expression...

    const args = [];
    if (token.id === ")") {
        same_line();
    } else {
        const open = is_line_break();
        if (open) {
            indent();
        }
        while (true) {
            line_check(open);
            args.push(ellipsis(argument_expression()));
            if (token.id === ")" || token === the_end) {
                break;
            }
            if (!open) {
                same_line();