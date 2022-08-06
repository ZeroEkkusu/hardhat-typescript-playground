import { ethers } from "hardhat"

export default async function () {
  const [deployer] = await ethers.getSigners()

  const BASE_FEE = ethers.utils.parseEther("0.0005")
  const GAS_PRICE_LINK = 1e9 // whatever

  const VRFCoordinatorV2Mock = await ethers.getContractFactory(
    "VRFCoordinatorV2Mock",
    deployer
  )
  const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(
    BASE_FEE,
    GAS_PRICE_LINK
  )
  await vrfCoordinatorV2Mock.deployed()
  console.log("Mocks deployed")

  return { vrfCoordinatorV2Mock }
}
