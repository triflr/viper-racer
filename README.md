# ZK Viper Racer

Viper Racer uses the Viper NFT from https://viper.folia.app that contains a simple random walk algorithm. It's used to make the Viper snake wander within a square. This project takes that algorithm and re-writes it as a zk circuit in circom. This enables the Viper snake position to be verified on chain after a variable number of steps in time. Since it is done as a zk proof instead of calculating the new position fully in solidity, it has a constant gas cost regardless of the number of steps. When the wander is constrained by a novel environment, namely a maze, it makes it possible to compare different Vipers ability to solve the maze in different time intervals. This is a necessary condition for creating a maze race between vipers.

## Viper Racer Arcade

The Viper race can be put into an arcade model such that players are competing for a high score. To compete, a user must pay some money and commit to a future block hash as a source of entropy. The funds collected in this process become a bounty which is awarded each time the high score is broken.


# Built using circom-starter

A basic circom project using [Hardhat](https://github.com/nomiclabs/hardhat) and [hardhat-circom](https://github.com/projectsophon/hardhat-circom). This combines the multiple steps of the [Circom](https://github.com/iden3/circom) and [SnarkJS](https://github.com/iden3/snarkjs) workflow into your [Hardhat](https://hardhat.org) workflow.

By providing configuration containing your Phase 1 Powers of Tau and circuits, this plugin will:

1. Compile the circuits
2. Apply the final beacon
3. Output your `wasm` and `zkey` files
4. Generate and output a `Verifier.sol`

## Documentation

See the source projects for full documentation and configuration

## Install

`yarn` to install dependencies

## Development builds

`yarn circom:dev` to build deterministic development circuits.

Further, for debugging purposes, you may wish to inspect the intermediate files. This is possible with the `--debug` flag which the `circom:dev` task enables by default. You'll find them (by default) in `artifacts/circom/`

To build a single circuit during development, you can use the `--circuit` CLI parameter. For example, if you make a change to `hash.circom` and you want to _only_ rebuild that, you can run `yarn circom:dev --circuit hash`.

## Production builds

`yarn circom:prod` for production builds (using `Date.now()` as entropy)
