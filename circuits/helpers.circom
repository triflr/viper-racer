pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template Modulo(n) {
  signal input in;
  // log("in", in);
  signal input mod;
  // log("mod", mod);
  signal q;
  signal output out;

 // TODO: come back here and make it work for rounded down numbers
  out <-- in % mod;
  // log("out", out);
  q <-- out \ mod; // where '\' is the integer division operator
  // log("q", q);
  // log("q * mod", q * mod);
  // in === q * mod + out;

  component lessThan = LessThan(n);
  lessThan.in[0] <== out;
  lessThan.in[1] <== mod;
  lessThan.out === 1;
}

template IsEven(n) {
    signal input in;
    signal output out;

    component num2Bits = Num2Bits(n);
    num2Bits.in <== in;

    component isZero = IsZero();
    isZero.in <== num2Bits.out[0];

    out <== isZero.out;
}

template IsOdd(n) {
    signal input in;
    signal output out;
    
    component isEven = IsEven(n);
    isEven.in <== in;

    component isZero = IsZero();
    isZero.in <== isEven.out;
    
    out <== isZero.out;
}

function maxBits(n) {
  var i = 0;
   while(n > 0) {
    i++;
    n = n >> 1;
   }
   return i;
}

function getBiggest(options, len) {
  var biggest = 0;
  for (var i = 0; i < len; i++) {
    if (options[i] > biggest) {
      biggest = options[i];
    }
  }
  return biggest;
}