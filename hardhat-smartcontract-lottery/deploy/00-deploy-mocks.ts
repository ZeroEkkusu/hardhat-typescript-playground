import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  if (developmentChains.includes(network.name)) {
    console.log("Deploying mocks...")

    const BASE_FEE = ethers.utils.parseEther("0.0005")
    const GAS_PRICE_LINK = 1e9 // whatever

    const args = [BASE_FEE, GAS_PRICE_LINK]

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    })

    console.log("Mocks deployed!\n")
  }
}

export default deployMocks
deployMocks.tags = ["all", "mocks"]
