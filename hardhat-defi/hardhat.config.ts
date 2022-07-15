import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import * as dotenv from "dotenv"

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.9" },
      { version: "0.4.19" },
      { version: "0.6.12" },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: process.env.POLYGON_MAINNET_URL || "",
        blockNumber: 30747259,
      },
    },
    mumbai: {
      chainId: 80001,
      url: process.env.MUMBAI_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
}

export default config
