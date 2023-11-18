

const hre = require("hardhat");
const { ethers } = require("hardhat");
const { exportCallDataGroth16 } = require("../utils/utils");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

const { ViperRNG } = require('../utils/viperRNG.js');
const { assert, expect } = require("chai");
const { Viper } = require('viper')

const maxSize = 1000;

describe("wanderMain circuit", () => {
  let circuit;
  const block128 = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
  const hash = '0x56eb92da56e5e204ee8c7abf939ed1bb4f9d3b4150cd4d54da7cb0bfb12b4201'
  const address = '0xfa398d672936dcf428116f687244034961545d91'

  const vRNG = new ViperRNG({
    hash, address
  })
  // NOTE: velocities are offset by 10_000 to avoid negative numbers
  const sampleInput = {
    "x": "0",
    "y": (maxSize / 2).toString(10),
    "prevAng": "0",
    "hash": vRNG.hash.map(x => x.toString()),
    "address": vRNG.address.map(x => x.toString()),
  };
  // console.log({ sampleInput })
  // log all the inputs
  // console.log(JSON.stringify(sampleInput, null, 2))
  const sanityCheck = true;

  before(async () => {
    circuit = await hre.circuitTest.setup("wanderMain");
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

  it("has OK RNG", async () => {
    const viperRNG = new ViperRNG({
      hash,
      address,
      step: 0
    })
    for (var i = 0; i < 100; i++) {
      const x = viperRNG.nextInt(0, 60)
      assert.isAtLeast(x, 0)
      assert.isAtMost(x, 60)
    }
  })

  it("has the correct output", async () => {

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
    viper.localRNG = viperRNG
    viper.x = parseInt(sampleInput.x)
    viper.startingX = viper.x
    viper.y = parseInt(sampleInput.y)
    viper.startingY = viper.y
    viper.previousAngle = parseInt(sampleInput.prevAng)

    const { x, y, angle } = viper.wander()

    // console.log({ x, y, angle })
    const expected = { out_x: x, out_y: y, out_ang: angle };
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


  it.skip("nft.sol works", async () => {
    // const NftVerifier = await ethers.getContractFactory("contracts/NftVerifier.sol:Verifier");
    // const nftVerifier = await NftVerifier.deploy();
    // await nftVerifier.deployed();

    // const Metadata = await ethers.getContractFactory("Metadata");
    // const metadata = await Metadata.deploy();
    // await metadata.deployed();

    // const Nft = await ethers.getContractFactory("NFT");
    // const nft = await Nft.deploy(metadata.address, nftVerifier.address);
    // await nft.deployed();

    // console.log(`committing...`)
    // await expect(nft.commit())
    //   .to.not.be.reverted;

    // const blockBefore = await ethers.provider.getBlock();
    // console.log(`waiting one block`)
    // await mine();
    // const blockAfter = await ethers.provider.getBlock();

    // // make sure block incremented by 1
    // assert.equal(blockAfter.number, blockBefore.number + 1);

    // console.log(`minting...`)

    // await expect(nft.mint())
    //   .to.not.be.reverted;
    // block = await ethers.provider.getBlock();
    // console.log({ block: block.number })

    // const body = await nft.getBody(1);
    // console.log({ body })

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



});
