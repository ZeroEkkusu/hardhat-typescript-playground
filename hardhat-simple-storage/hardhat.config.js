require("@nomiclabs/hardhat-waffle")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("./tasks/block-number")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
/*task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})*/

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "abc"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "abc"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "abc"

module.exports = {
  // defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
    },
  },
  solidity: "0.8.8",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC",
  },
}
