pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/gates.circom";
include "../node_modules/circomlib/circuits/mux1.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "QuinSelector.circom";
include "hardcodedSinCos.circom";
include "helpers.circom";
include "isOK.circom";

template Wander(lineLength, maxAngDiff, step) {
  signal input x;
  signal input y;
  signal input prevAng;
  signal input hash[128];
  signal input address[128];

  // for (var i = 0; i < 128; i++) {
  //   log("address-i", i, address[i]);
  //   log("hash-i", i, hash[i]);
  // }
  signal output out_x;
  signal output out_y;
  signal output out_ang;

  var randomOffset = 0;
  var bitsNeeded = maxBits(maxAngDiff);
  var angleDeltaBits[bitsNeeded];

  component asNonBits[bitsNeeded];
  for (var i = 0; i < bitsNeeded; i++) {
    var index = ((step + i)  * (i + 1)) % 128;
     // the following is just grabbing the last bit to get the value mod 2
    var asNonBit = (hash[index] + address[index]);
    asNonBits[i] = Num2Bits(2);
    asNonBits[i].in <== asNonBit;
    angleDeltaBits[i] = asNonBits[i].out[0];
  }
  component angleDeltaComp = Bits2Num(bitsNeeded);
  angleDeltaComp.in <== angleDeltaBits;
  component modulo = Modulo(bitsNeeded);
  modulo.in <== angleDeltaComp.out;
  modulo.mod <== maxAngDiff;
  // var angleDelta = modulo.out;

  // // this ensures that the search for a working angle doesn't always sart by adding to the angle (turning clockwise)
  // if (angleDelta <= maxDifferenceBetweenAngle / 2) {
  // angleDelta = angleDelta * -1;
  // }
  // component lessThan = LessThan(bitsNeeded);  // TODO: add back when negatives are addressed
  // lessThan.in[0] <== modulo.out;
  // lessThan.in[1] <== maxAngDiff >> 1; // floor (div / 2)

  // component mux = Mux1();
  // mux.c[0] <== modulo.out;
  // mux.c[1] <== modulo.out * -1; // TODO: offset this so it's not negative
  // mux.s <== lessThan.out;
  var angleDelta = modulo.out; // mux.out;
  // log("angleDelta", angleDelta);

  component isEven = IsEven(bitsNeeded); // TODO: confirm bitsNeeded
  isEven.in <== modulo.out; // mux.out; // TODO: change back when negative is fixed

  component mux2 = Mux1();
  mux2.c[0] <== 1;
  mux2.c[1] <== -1;
  mux2.s <== isEven.out;

  var isOddAdditionalRandom = mux2.out;
  // log("isOddAdditionalRandom", isOddAdditionalRandom);

  var changeByAmount = 45;
  var anglesInACircle = 360;
  var found = 0;
  // log("found start", found);

  var found_x;
  var found_y;
  var found_ang;
  component isOK[8];
  component muxes[8];
  component isZeros[8];
  component isOdd[8];
  component addOrRemoves[8];
  component modulos[8];
  component quinSin[8];
  component quinCos[8];

  for (var i = 0; i < 8; i++) {
    isOdd[i] = IsOdd(4); // 4 is the number of bits needed to represent 8
    isOdd[i].in <== i;

    addOrRemoves[i] = Mux1();
    addOrRemoves[i].c[0] <== -1;
    addOrRemoves[i].c[1] <== 1;
    addOrRemoves[i].s <== isOdd[i].out;

    // this is diivide by 2 and Math.ceil()
    var timesTried = (i + 1) >> 1;
    var changeBy = angleDelta + (timesTried * changeByAmount) * -1 * addOrRemoves[i].out;
    // log("prevAng", prevAng);
    // log("changeBy", changeBy);
    var newAngle = prevAng + (changeBy * isOddAdditionalRandom) + (360 * 2); // % 360;
    // log("newAngle", newAngle);
    modulos[i] = Modulo(maxBits(360 * 3));
    modulos[i].in <== newAngle;
    modulos[i].mod <== 360;
    newAngle = modulos[i].out;
    // log("newAngle", newAngle);
    

    quinCos[i] = QuinSelector(360);
    quinCos[i].in <== returnCosSin(0);
    quinCos[i].index <== newAngle;

    quinSin[i] = QuinSelector(360);
    quinSin[i].in <== returnCosSin(1);
    quinSin[i].index <== newAngle;
    // log("newAngle", newAngle);
    // log("x", x);
    // log("quinCos[i].out", quinCos[i].out);
    // log("y", y);
    // log("quinSin[i].out", quinSin[i].out);
    // log("lineLength", lineLength);
    var potentialNewX = x + quinCos[i].out * lineLength / 100; // cos is increased by 10x
    var potentialNewY = y + quinSin[i].out * lineLength / 100; // sin is increased by 10x
    // log("potentialNewX", potentialNewX);
    // log("potentialNewY", potentialNewY);

    isZeros[i] = IsZero();
    isZeros[i].in <== found;
    var stillNotFound = isZeros[i].out;

    // found_x = stillNotFound ? potentialNewX : found_x;
    muxes[i] = MultiMux1(3);
    muxes[i].c[0][0] <== found_x;
    muxes[i].c[0][1] <-- potentialNewX;
    muxes[i].c[1][0] <== found_y;
    muxes[i].c[1][1] <-- potentialNewY;
    muxes[i].c[2][0] <== found_ang;
    muxes[i].c[2][1] <== newAngle;

    muxes[i].s <== stillNotFound;
    
    found_x = muxes[i].out[0];
    found_y = muxes[i].out[1];
    found_ang = muxes[i].out[2];

    // log("found_x", found_x);
    // log("found_y", found_y);
    // found = isOK ? 1 : found;
    isOK[i] = IsOK();
    isOK[i].x <== found_x;
    isOK[i].y <== found_y;

    found = isOK[i].out;
    // log("found", found);
  }
  // found === 1;

  out_x <== found_x;
  out_y <== found_y;
  out_ang <== found_ang;
}



// // Pseudo-random function using a basic hash function
// function some_pseudo_random_function(seedBits, index) {
//     // Simple hash-like function: for illustration purposes only
//     // This is not cryptographically secure and is just a basic example
//     var pseudoRandomValue = 0;
//     for (var i = 0; i < seedBits.length; i++) {
//         pseudoRandomValue += (seedBits[i] + index) * (i + 1);
//     }
//     return pseudoRandomValue;
// }

// template RandomShuffleHash(bits) {
//     signal input hash[128];
//     signal input seed[128];       // Integer input used as a seed
//     signal output shuffledHash[bits]; // Output: shuffled 256-bit hash

//     // Example: For each bit in the hash, swap it with another bit based on the seed
//     for (var i = 0; i < 256; i++) {
//         var swapIndex = (some_pseudo_random_function(seedToBits.out, i)) % 256;
//         shuffledHash[i] <== hash[swapIndex];
//     }
// }