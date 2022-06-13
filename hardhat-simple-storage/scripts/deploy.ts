import { ethers, run, network } from "hardhat"
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types"

async function main() {
  const SimpleStorageFactory: SimpleStorage__factory =
    (await ethers.getContractFactory("SimpleStorage")) as SimpleStorage__factory
  console.log("Deploying...")

  const simpleStorage: SimpleStorage = await SimpleStorageFactory.deploy()
  console.log(`Deployed contract to ${simpleStorage.address}`)

  let verification
  if (network.config.chainId == 4 && process.env.ETHERSCAN_API_KEY) {
    console.log(
      "Waiting for Etherscan to index the transaction before verifying"
    )
    verification = simpleStorage.deployTransaction
      .wait(6)
      .then(() => verify(simpleStorage.address, []))
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current value: ${currentValue}`)
  const transactionResponse = await simpleStorage.store(7)
  await transactionResponse.wait(1)
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated value: ${updatedValue}`)

  await verification
}

async function verify(contractAddress: string, args: any[]) {
  console.log("Verifying...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArgs: args,
    })
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Info: Already verified")
    } else {
      console.log(e)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
