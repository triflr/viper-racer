

const hre = require("hardhat");
const { ethers } = require("hardhat");
const { exportCallDataGroth16 } = require("../utils/utils");
const { deployContracts } = require("../scripts/utils.js");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { ViperRNG } = require('../utils/viperRNG.js');
const { assert, expect } = require("chai");
const { Viper } = require('viper')

const maxSize = 1000;
const steps = 2;

describe("viperMain circuit", () => {
  let circuit;

  const block128 = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
  const hash = '0x56eb92da56e5e204ee8c7abf939ed1bb4f9d3b4150cd4d54da7cb0bfb12b4201'
  const address = '0xfa398d672936dcf428116f687244034961545d91'

  const vRNG = new ViperRNG({
    hash, address
  })

  const sampleInput = {
    "x": "0",
    "y": (maxSize / 2).toString(10),
    "prevAng": "0",
    "hash": (BigInt(hash) & block128).toString(10),
    "address": (BigInt(address) & block128).toString(10),
  };
  // console.log({ sampleInput })
  // log all the inputs
  console.log(JSON.stringify(sampleInput, null, 2))
  const sanityCheck = true;

  before(async () => {
    circuit = await hre.circuitTest.setup("viperMain");
  });

  it("produces a witness with valid constraints", async () => {
    const witness = await circuit.calculateWitness(sampleInput, sanityCheck);
    console.log(`${witness.length} constraints`)
    await circuit.checkConstraints(witness);
  });

  it("has expected witness values", async () => {
    const witness = await circuit.calculateLabeledWitness(
      sampleInput,
      sanityCheck
    );
    // console.log({ witness })

    // assert.propertyVal(witness, "main.squared", sampleInput.squared);
    // assert.propertyVal(witness, "main.calculatedRoot", sampleInput.calculatedRoot);
    // assert.propertyVal(witness, "main.calculatedSquared", (sampleInput.calculatedRoot ** 2).toString())
    // assert.propertyVal(witness, "main.out", "1");
  });

  async function runViper(steps, hash, address) {
    const viperRNG = new ViperRNG({
      hash,
      address,
      step: 0
    })
    const viper = new Viper({
      setting: "server"
    })
    const prandoRNG = viper.rng;
    viper.rng = viperRNG
    viper.wanderRNG = viperRNG
    viper.x = parseInt(sampleInput.x)
    viper.startingX = viper.x
    viper.y = parseInt(sampleInput.y)
    viper.startingY = viper.y
    viper.previousAngle = parseInt(sampleInput.prevAng)

    let expected
    for (var i = 0; i < steps; i++) {
      const { x, y, angle } = viper.wander()
      viper.angle = angle
      viper.previousAngle = angle
      viper.x = x
      viper.previousX = x
      viper.y = y
      viper.previousY = y
      console.log({ x, y, angle })
      expected = { out_x: x, out_y: y };
    }
    return expected
  }

  it("has the correct output", async () => {
    const expected = await runViper(steps, hash, address)
    console.log({ expected })
    const witness = await circuit.calculateWitness(sampleInput, sanityCheck);
    await circuit.assertOut(witness, expected);
  });

  it.skip("NftVerifier.sol works", async () => {
    // const NftVerifier = await ethers.getContractFactory("contracts/NftVerifier.sol:Verifier");
    // const nftVerifier = await NftVerifier.deploy();
    // await nftVerifier.deployed();

    // let dataResult = await exportCallDataGroth16(
    //   sampleInput,
    //   "./circuits/nft.wasm",
    //   "./circuits/nft.zkey"
    // );
    // let result = await nftVerifier.verifyProof(
    //   dataResult.a,
    //   dataResult.b,
    //   dataResult.c,
    //   dataResult.Input
    // );
    // assert.equal(result, true);
  })


  it.only("racer.sol works", async () => {
    const { racer } = await deployContracts();
    const [owner] = await hre.ethers.getSigners();
    const value = await racer.costToPlay()
    // value should be 0
    assert.equal(value, 0)
    const tx = await racer.commitToRace({ value })
    expect(tx).to.not.be.reverted;
    await tx.wait()
    // console.log({ tx })
    const betBlock = await racer.plays(owner.address)
    // console.log({ betBlock })
    expect(betBlock).to.equal(tx.blockNumber);

    const blockHash = tx.blockHash
    // console.log({ blockHash })

    const blockHash128 = BigInt(blockHash) & block128
    const addresss128 = BigInt(owner.address) & block128

    sampleInput.hash = blockHash128.toString(10)
    sampleInput.address = addresss128.toString(10)
    // console.log({ sampleInput })

    const expected = await runViper(steps, blockHash128.toString(10), addresss128.toString(10))
    const witness = await circuit.calculateWitness(sampleInput, sanityCheck);
    await circuit.assertOut(witness, expected);

    let dataResult = await exportCallDataGroth16(
      sampleInput,
      "./circuits/viperMain.wasm",
      "./circuits/viperMain.zkey"
    );
    // console.log({ dataResult })

    let tx2 = await racer.resolveRace(
      dataResult.a,
      dataResult.b,
      dataResult.c,
      dataResult.Input
    );
    expect(tx2).to.not.be.reverted;
    await tx2.wait()
    // console.log({ tx2 })

    const furthestDistance = await racer.furthestDistance()
    // console.log({ furthestDistance })
    expect(furthestDistance).to.equal(expected.out_x.toString())

    const fastestPlayer = await racer.fastestPlayer()
    // console.log({ fastestPlayer })
    expect(fastestPlayer).to.equal(owner.address)
  })



});
