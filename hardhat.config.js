require("hardhat-circom");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  mocha: {
    timeout: 100_000_000
  },
  solidity: {
    compilers: [
      {
        version: "0.6.11",
      },
      {
        version: "0.8.15",
        settings: {
          viaIR: false,
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      gasPrice: 10_000_000_000,
      blockGasLimit: 30_000_000,
      chainId: 12345,
      // loggingEnabled: true
    },
    chiliz: {
      url: "https://spicy-rpc.chiliz.com",
      accounts: { mnemonic: process.env.deploymentKey },
    },
    linea: {
      url: "https://linea-testnet.rpc.thirdweb.com",
      accounts: { mnemonic: process.env.deploymentKey },
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: { mnemonic: process.env.deploymentKey },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: { mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" }
    },
    optimistic: {
      url: "http://127.0.0.1:8545",
      accounts: { mnemonic: "test test test test test test test test test test test junk" },
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY,
      accounts: { mnemonic: process.env.deploymentKey },
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/' + process.env.INFURA_API_KEY,
      accounts: { mnemonic: process.env.deploymentKey },
      gas: 5000000,
    },
    optimismkovan: {
      url: "https://kovan.optimism.io",
      accounts: { mnemonic: process.env.deploymentKey },
    },
    optimismgoerli: {
      url: "https://opt-goerli.g.alchemy.com/v2/AABlV686HfIY7zb97aYZCx9uUDCb2m_R",
      accounts: { mnemonic: process.env.deploymentKey },
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/' + process.env.INFURA_API_KEY,
      accounts: { mnemonic: process.env.deploymentKey },
      gasPrice: 10_000_000_000, // 10 GWEI
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/' + process.env.INFURA_API_KEY,
      accounts: { mnemonic: process.env.deploymentKey },
      gasPrice: 15_000_000_000, // 15 GWEI
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY,
      accounts: { mnemonic: process.env.deploymentKey },
      gasPrice: 50_000_000_000,
    },
  },
  gasReporter: {
    currency: "EUR",
    gasPrice: 42,
    url: "http://localhost:8545",
    coinmarketcap: "38b60711-0559-45f4-8bda-e72f446c8278",
    enabled: true,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.etherscanApiNew,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: true,
    runOnCompile: true,
    strict: true,
  },
  circom: {
    inputBasePath: "./circuits",
    ptau: "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau",
    circuits: [
      {
        name: "wanderMain",
        // No protocol, so it defaults to groth16
      },
      {
        name: "viperMain",
        // No protocol, so it defaults to groth16
      },
      // {
      //   name: "division",
      //   // No protocol, so it defaults to groth16
      // },
      // {
      //   name: "simple-polynomial",
      //   // Generate PLONK
      //   protocol: "plonk",
      // },
      // {
      //   name: "hash",
      //   // Explicitly generate groth16
      //   protocol: "groth16",
      // },
    ],
  },
};
