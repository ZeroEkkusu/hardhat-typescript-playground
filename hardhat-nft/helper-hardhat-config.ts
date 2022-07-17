import { BigNumber } from "ethers"
import { ethers } from "hardhat"

interface networkConfigItem {
  blockConfirmations?: number
}

interface networkConfigInfo {
  [key: string]: networkConfigItem
}

const networkConfig: networkConfigInfo = {
  mumbai: {
    blockConfirmations: 5,
  },
  hardhat: {},
  localhost: {},
}

const developmentChains = ["hardhat", "localhost"]

export { networkConfig, developmentChains }
