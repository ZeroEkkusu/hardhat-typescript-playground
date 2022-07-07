import { ethers, network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Raffle } from "../typechain-types"

async function enter() {
  const raffle: Raffle = await ethers.getContract("Raffle")
  const entranceFee = await raffle.getEntranceFee()

  await raffle.enterRaffle({ value: entranceFee })
}

enter()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
