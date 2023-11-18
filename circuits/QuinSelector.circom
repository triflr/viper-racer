pragma circom 2.1.6;

// from https://github.com/darkforest-eth/circuits

template CalculateTotal(n) {
    signal input in[n];
    signal output out;

    signal sums[n];

    sums[0] <== in[0];

    for (var i = 1; i < n; i++) {
        sums[i] <== sums[i-1] + in[i];
    }

    out <== sums[n-1];
}

template QuinSelector(choices) {
    signal input in[choices];
    signal input index;
    signal output out;
    
    // Ensure that index < choices
    // log("index", index);
    // log("choices", choices);
    component lessThan = LessThan(17); // max 10_000 aka 1.0000
    lessThan.in[0] <== index;
    lessThan.in[1] <== choices;
    lessThan.out === 1;

    component calcTotal = CalculateTotal(choices);
    component eqs[choices];

    // For each item, check whether its index equals the input index.
    for (var i = 0; i < choices; i ++) {
        eqs[i] = IsEqual();
        eqs[i].in[0] <== i;
        eqs[i].in[1] <== index;

        // eqs[i].out is 1 if the index matches. As such, at most one input to
        // calcTotal is not 0.
        calcTotal.in[i] <== eqs[i].out * in[i];
    }

    // Returns 0 + 0 + 0 + item
    out <== calcTotal.out;
}