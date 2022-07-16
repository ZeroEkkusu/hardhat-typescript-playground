import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"
import { ethers, network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"
import { IERC20 } from "../typechain-types/IERC20"
import { ILendingPool } from "../typechain-types/ILendingPool"
import { ILendingPoolAddressesProvider } from "../typechain-types/ILendingPoolAddressesProvider"
import { getWeth, AMOUNT } from "./getWeth"

async function main() {
  // Wrap the coin
  await getWeth()

  // Deposit
  const [deployer] = await ethers.getSigners()
  const lendingPool = await getLendingPool()
  const wethTokenAddress = networkConfig[network.name].wrappedCoin!
  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer.address, 0)
  console.log("Deposited")

  // Borrow
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  )
  const daiPrice = await getDaiPrice()
  const amountDaiToBorrow =
    // @ts-ignore
    (availableBorrowsETH.toString() * 0.95) / daiPrice.toNumber()
  console.log(`Borrowable DAI: ${amountDaiToBorrow}`)
  const amountDaiToBorrowWei = ethers.utils.parseEther(
    amountDaiToBorrow.toFixed(18).toString()
  )
  await borrowDai(lendingPool, amountDaiToBorrowWei, deployer)
  await getBorrowUserData(lendingPool, deployer)

  // Repay
  await repay(amountDaiToBorrowWei, lendingPool, deployer)
  await getBorrowUserData(lendingPool, deployer)
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

async function getBorrowUserData(
  lendingPool: ILendingPool,
  account: SignerWithAddress
) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account.address)

  console.log(
    `Total collateral: ${totalCollateralETH} (${ethers.utils.formatEther(
      totalCollateralETH
    )})`
  )
  console.log(
    `Total debt: ${totalDebtETH} (${ethers.utils.formatEther(totalDebtETH)})`
  )
  console.log(
    `Available borrows: ${availableBorrowsETH} (${ethers.utils.formatEther(
      availableBorrowsETH
    )})`
  )

  return { availableBorrowsETH, totalDebtETH }
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    networkConfig[network.name].daiEthPriceFeed!
  )
  const { answer } = await daiEthPriceFeed.latestRoundData()
  console.log(`DAI/ETH: ${answer} (${ethers.utils.formatEther(answer)})`)
  return answer
}

async function borrowDai(
  lendingPool: ILendingPool,
  amountDaiToBorrowWei: BigNumber,
  account: SignerWithAddress
) {
  const borrowTx = await lendingPool.borrow(
    networkConfig[network.name].daiAddress!,
    amountDaiToBorrowWei,
    "2",
    "0",
    account.address
  )
  await borrowTx.wait(1)

  console.log("Borrowed")
}

async function repay(
  amount: BigNumber,
  lendingPool: ILendingPool,
  account: SignerWithAddress
) {
  const daiAddress = networkConfig[network.name].daiAddress!
  await approveErc20(daiAddress, lendingPool.address, amount, account)
  const repayTx = await lendingPool.repay(
    daiAddress,
    amount,
    "2",
    account.address
  )
  await repayTx.wait(1)
  console.log("Repaid")
}

main().catch((error) => {
  console.log(error)
  process.exit(1)
})
