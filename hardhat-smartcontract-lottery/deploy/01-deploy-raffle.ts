import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"
import { VRFCoordinatorV2Mock } from "../typechain-types"
import { BigNumber } from "ethers"
import verify from "./../utils/verify"

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  let vrfCoordinatorV2Address: string, subscriptionId: BigNumber

  if (developmentChains.includes(hre.network.name)) {
    const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    )
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait(1)
    subscriptionId = transactionReceipt.events![0].args!.subId
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    )
  } else {
    vrfCoordinatorV2Address = networkConfig[network.name].vrfCoordinatorV2!
    subscriptionId = networkConfig[network.name].subscriptionId!
  }

  const entranceFee =
    networkConfig[network.name].entranceFee || ethers.utils.parseEther("1")
  const keyHash =
    networkConfig[network.name].keyHash ||
    "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f"
  const callbackGasLimit =
    networkConfig[network.name].callbackGasLimit || BigNumber.from(500000)
  const interval = networkConfig[network.name].interval || BigNumber.from(30)
  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    keyHash,
    subscriptionId,
    callbackGasLimit,
    interval,
  ]

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(raffle.address, args)
  }
}

export default deployRaffle
deployRaffle.tags = ["all", "raffle"]
