
const RacerABI = require("./contractMetadata/ABI-chiliz-Racer.json");
const Racer = require("./contractMetadata/chiliz-Racer.json"); // TODO: replace with mainnet
const RacerChiliz = require("./contractMetadata/chiliz-Racer.json");

module.exports = {
  Racer: {
    abi: RacerABI.abi,
    networks: {
      '1': Racer,
      'homestead': Racer,
      'mainnet': Racer,
      '88882': RacerChiliz,
      'chiliz': RacerChiliz,
    },
  }
}