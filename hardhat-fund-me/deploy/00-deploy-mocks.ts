import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} from "../helper-hardhat-config"

// todo: explicit type
const deployMocks = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { deployments, getNamedAccounts, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  if (developmentChains.includes(network.name)) {
    log("Local network detected. Deploying mocks...")
    await deploy("MockV3Aggregator", {
      // contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    log("Mocks deployed.\n")
  }
}

export default deployMocks
deployMocks.tags = ["all", "mocks"]
