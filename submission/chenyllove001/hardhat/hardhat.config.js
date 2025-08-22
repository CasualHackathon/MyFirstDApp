require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@chainlink/env-enc").config();
require('hardhat-deploy');

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const SEPOLIA_KEY = process.env.SEPOLIA_KEY;
const SEPOLIA_KEY_2 = process.env.SEPOLIA_KEY_2;
const LOCAL_URL = process.env.LOCAL_URL;
const LOCAL_KEY = process.env.LOCAL_KEY;
const ZG_URL = process.env.ZG_URL;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  //配置网络环境，url可以是alchemy、infura、QuickNode等的url
  networks: {
    local: {
      url: LOCAL_URL,
      accounts: [LOCAL_KEY],
      chainId: 31337
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [SEPOLIA_KEY,SEPOLIA_KEY_2],
      chainId: 11155111
    },
    zgtestnet: {
      url: ZG_URL,
      chainId: 16601,
      accounts: [SEPOLIA_KEY]
  }
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY
  },
  namedAccounts: {
    one: {
      default: 0, // 可选自定义地址
    },
    two: {
      default: 1, // 可选
    }
  }
}

