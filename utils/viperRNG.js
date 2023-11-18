class ViperRNG {
  constructor(overwriteOptions = {}) {
    const options = {
      hash: null,
      address: null,
      step: 0,
      ...overwriteOptions
    }
    let { hash, address, step } = options
    // hash must not be empty
    if (!hash) {
      throw new Error(`hash must be provided`)
    }
    // address must not be empty
    if (!address) {
      throw new Error(`address must be provided`)
    }
    // this.step must be an integer
    if (step != Math.floor(step)) {
      throw new Error(`step must be an integer, got ${step}`)
    }
    this.hash = this.strToBits(hash)
    this.address = this.strToBits(address)
    // for (var i = 0; i < 128; i++) {
    //   console.log(`address-i ${i} ${this.address[i]}`)
    //   console.log(`hash-i ${i} ${this.hash[i]}`)
    // }
    this.step = step
  }

  strToBits(str) {
    const block128 = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
    const num = BigInt(str) & block128
    const bits = num.toString(2).padStart(128, '0').split('').map(x => parseInt(x))
    if (bits.length != 128) {
      throw new Error(`stringToBits: expected 128 bits, got ${bits.length}`)
    }
    return bits
  }

  nextInt(min, max, bitsNeeded = 6) {

    const returnBits = [];
    for (var i = 0; i < bitsNeeded; i++) {
      var index = ((this.step + i) * (i + 1)) % 128;
      var asNonBit = this.hash[index] + this.address[index];
      var asBit = asNonBit % 2;
      returnBits.unshift(asBit); // NOTE: this is weird that Bits2Num is backwards
    }
    this.step++;
    const returnNum = Number(BigInt(`0b${returnBits.join("")}`));
    return returnNum % (max - min) + min;
  }
}


module.exports = {
  ViperRNG,
};
