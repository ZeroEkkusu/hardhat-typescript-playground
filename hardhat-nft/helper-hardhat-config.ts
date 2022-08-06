import { ethers } from "hardhat"

interface networkConfigItem {
  blockConfirmations?: number
  vrfCoordinatorV2?: string
  subscriptionId?: string
  gasLane?: string
  mintFee?: string
  callbackGasLimit?: string
}

interface networkConfigInfo {
  [key: string]: networkConfigItem
}

const networkConfig: networkConfigInfo = {
  mumbai: {
    blockConfirmations: 5,
    vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    subscriptionId: "822",
    gasLane:
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    mintFee: ethers.utils.parseEther("0.01").toString(),
    callbackGasLimit: "500000",
  },
  hardhat: {
    gasLane:
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    mintFee: ethers.utils.parseEther("0.01").toString(),
    callbackGasLimit: "500000",
  },
  localhost: {
    gasLane:
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    mintFee: ethers.utils.parseEther("0.01").toString(),
    callbackGasLimit: "500000",
  },
}

const developmentChains = ["hardhat", "localhost"]

export { networkConfig, developmentChains }
