import { ethers, network } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import verify from "../utils/verify"

export default async function () {
  const [deployer] = await ethers.getSigners()

  const args: [] = []
  console.log("Deploying...")
  const BasicNft = await ethers.getContractFactory("BasicNft", deployer)
  const basicNft = await BasicNft.deploy()
  await basicNft.deployTransaction.wait(
    networkConfig[network.name].blockConfirmations || 1
  )

