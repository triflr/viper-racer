
const RacerABI = require("./contractMetadata/ABI-chiliz-Racer.json");
const Racer = require("./contractMetadata/chiliz-Racer.json"); // TODO: replace with mainnet
const RacerChiliz = require("./contractMetadata/chiliz-Racer.json");
const RacerLocalhost = require("./contractMetadata/localhost-Racer.json");
const RacerLinea = require("./contractMetadata/linea-Racer.json");
const RacerBaseSepolia = require("./contractMetadata/baseSepolia-Racer.json");

module.exports = {
  Racer: {
    abi: RacerABI.abi,
    networks: {
      '1': Racer,
      'homestead': Racer,
      'mainnet': Racer,
      '88882': RacerChiliz,
      'chiliz': RacerChiliz,
      '1337': RacerLocalhost,
      'localhost': RacerLocalhost,
      '59140': RacerLinea,
      'linea': RacerLinea,
      '84532': RacerBaseSepolia,
      'baseSepolia': RacerBaseSepolia,
    },
  }
}