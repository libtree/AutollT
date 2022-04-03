function deconstruct(number) {

// This function deconstructs a number, reducing it to its components:
// a sign, an integer coefficient, and an exponent, such that

//            number = sign * coefficient * (2 ** exponent)

    let sign = 1;
    let coefficient = number;
    let exponent = 0;

// Remove the sign from the coefficient.

    if (coefficient < 0) {
        coefficient = -coefficient;
        sign = -1;
    }

    if (Number.isFinite(number) && number 