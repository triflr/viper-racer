pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/bitify.circom";
include "wander.circom";

template Viper(steps, lineLength, maxAngDiff) {
    signal input x;
    signal input y;
    signal input prevAng;
    var prevAng_ = prevAng;
    signal input hash;
    signal input address;

    signal output out_x;
    signal output out_y;


    // just using the first 128 bits of the hash and address
    component hashToBits = Num2Bits(128);
    hashToBits.in <== hash;
    signal hash_[128];
    for (var i = 0; i < 128; i++) {
      hash_[i] <== hashToBits.out[i];
    }

    component addressToBits = Num2Bits(128);
    addressToBits.in <== address;
    signal address_[128];
    for (var i = 0; i < 128; i++) {
      address_[i] <== addressToBits.out[i];
    }

    component wanders[steps];
    
    var x_ = x;
    var y_ = y;

    for (var i = 0; i < steps; i++) {
      wanders[i] = Wander(lineLength, maxAngDiff, i);
      wanders[i].x <== x_;
      wanders[i].y <== y_;
      wanders[i].prevAng <== prevAng_;
      wanders[i].hash <== hash_;
      wanders[i].address <== address_;
      x_ = wanders[i].out_x;
      y_ = wanders[i].out_y;
      prevAng_ = wanders[i].out_ang;
    }

    out_x <== x_;
    out_y <== y_;
}

component main = Viper(76, 100, 60);
