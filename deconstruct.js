function deconstruct(number) {

// This function deconstructs a number, reducing it to its components:
// a sign, an integer coefficient, and an exponent, such that

//            number = sign * coefficient * (2 ** exponent)

    let sign = 1;
    let coefficient = number;
    let exponent = 0;

// Remove the sign fr