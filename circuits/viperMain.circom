pragma circom 2.1.6;

include "viper.circom";

// 76 is max rn
component main { public [x, y, prevAng, hash, address] } = Viper(79, 100, 60);
