import { BigNumber } from "ethers"
import { ethers } from "hardhat"

interface networkConfigItem {
  vrfCoordinatorV2?: string
  blockConfirmations?: number
  entranceFee?: BigNumber
  keyHash?: string
  subscriptionId?: BigNumber
  callbackGasLimit?: BigNumber
  interval?: BigNumber
}

interface networkConfigInfo {
  [key: string]: networkConfigItem
}

const networkConfig: networkConfigInfo = {
  mumbai: {
    blockConfirmations: 6,
    vrfCoordinatorV2: "0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed",
    entranceFee: ethers.utils.parseEther("1"),
    keyHash:
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    subscriptionId: BigNumber.from(0),
    callbackGasLimit: BigNumber.from(500000),
    interval: BigNumber.from(30),
  },
  hardhat: {},
  localhost: {},
}

const developmentChains = ["hardhat", "localhost"]

export { networkConfig, developmentChains }
