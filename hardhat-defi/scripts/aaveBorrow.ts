import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"
import { ethers, network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"
import { IERC20 } from "../typechain-types/IERC20"
import { ILendingPool } from "../typechain-types/ILendingPool"
import { ILendingPoolAddressesProvider } from "../typechain-types/ILendingPoolAddressesProvider"
import { getWeth, AMOUNT } from "./getWeth"

async function main() {
  await getWeth()
  const [deployer] = await ethers.getSigners()
  const lendingPool = await getLendingPool()
  const wethTokenAddress = networkConfig[network.name].wrappedCoin!
  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer.address, 0)
  console.log("Deposited")
}

async function getLendingPool(): Promise<ILendingPool> {
  const lendingPoolAddressProvider: ILendingPoolAddressesProvider =
    await ethers.getContractAt(
      "ILendingPoolAddressesProvider",
      networkConfig[network.name].lendingPoolAddressProvider!
    )
  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    networkConfig[network.name].lendingPool!
  )
  return lendingPool
}

async function approveErc20(
  erc20Address: string,
  spenderAddress: string,
  amountToSpend: BigNumber,
  account: SignerWithAddress
) {
  const erc20Token: IERC20 = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  )
  await (await erc20Token.approve(spenderAddress, amountToSpend)).wait(1)
  console.log("Approved")
}

main().catch((error) => {
  console.log(error)
  process.exit(1)
})
