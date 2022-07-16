import { ethers, network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"
import { IWeth } from "../typechain-types"

const AMOUNT = ethers.utils.parseEther("0.01")

const getWeth = async function () {
  const [deployer] = await ethers.getSigners()
  /*const tx = {
    from: deployer.address,
    to: networkConfig[network.name].wrappedCoin,
    data: "0xd0e30db0", // deposit
    value: AMOUNT,
  }
  deployer.sendTransaction(tx)*/
  const iWeth: IWeth = await ethers.getContractAt(
    "IWeth",
    networkConfig[network.name].wrappedCoin!,
    deployer
  )
  await (await iWeth.deposit({ value: AMOUNT })).wait(1)
  const wethBalance = await iWeth.balanceOf(deployer.address)
  console.log(
    `Balance: ${wethBalance} (${ethers.utils.formatEther(wethBalance)})`
  )
}

export { getWeth, AMOUNT }
