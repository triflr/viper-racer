
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("../scripts/utils.js");

describe("Racer Tests", function () {
  this.timeout(50000000);

  it("is racer", async () => {
    const { racer } = await deployContracts();
    const initialBestScore = 0
    const bestScore = await racer.furthestDistance()
    expect(bestScore).to.equal(initialBestScore)
  })

});
