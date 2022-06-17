import { ethers, getNamedAccounts } from "hardhat"

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)
  console.log("Withdrawing funds...")
  const transactionResponse = await fundMe.withdraw()
  await transactionResponse.wait(1)
  console.log("Withdrawn!")
}

main()
  .then(() => process.exit(0))
  .catch((error: any) => {
    console.log(error)
    process.exit(1)
  })
