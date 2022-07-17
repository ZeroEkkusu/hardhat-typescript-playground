import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers, network } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { BasicNft } from "../typechain-types"
import verify from "../utils/verify"

export default async function (): Promise<{
  deployer: SignerWithAddress
  basicNft: BasicNft
}> {
  const [deployer] = await ethers.getSigners()

  const args: [] = []
  console.log("Deploying...")
  const BasicNft = await ethers.getContractFactory("BasicNft", deployer)
  const basicNft = await BasicNft.deploy()
  await basicNft.deployTransaction.wait(
    networkConfig[network.name].blockConfirmations || 1
  )

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(basicNft.address, args)
  }

  return { deployer, basicNft }
}
