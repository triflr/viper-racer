pragma circom 2.1.6;
include "../node_modules/circomlib/circuits/comparators.circom";
include "helpers.circom";

template IsOK() {
  signal input x;
  signal input y;
  signal output out;

  component notOutsideCanvas = NotOutsideCanvas();
  notOutsideCanvas.x <== x;
  notOutsideCanvas.y <== y;

  out <== notOutsideCanvas.out;
}

template NotOutsideCanvas() {
  signal input x;
  signal input y;
  signal output out;
  var decimals = 4;
  var canvasSizeRaw = 1000;
  var canvasSize = canvasSizeRaw * (10 ** decimals);
  var marginRaw = 100;
  var margin = marginRaw * (10 ** decimals);

  var isOutsideCanvas = 0;

  var bitsNeeded = maxBits(canvasSize);
  component lessThan = LessThan(bitsNeeded);
  lessThan.in[0] <== margin;
  lessThan.in[1] <== x;

  component lessThan2 = LessThan(bitsNeeded);
  lessThan2.in[0] <== margin;
  lessThan2.in[1] <== y;

  component greaterThan = GreaterThan(bitsNeeded);
  greaterThan.in[0] <== canvasSize - margin;
  greaterThan.in[1] <== x;

  component greaterThan2 = GreaterThan(bitsNeeded);
  greaterThan2.in[0] <== canvasSize - margin;
  greaterThan2.in[1] <== y;
  
  component multiAND = MultiAND(4);
  multiAND.in[0] <== lessThan.out;
  multiAND.in[1] <== lessThan2.out;
  multiAND.in[2] <== greaterThan.out;
  multiAND.in[3] <== greaterThan2.out;

  out <== multiAND.out;
}
