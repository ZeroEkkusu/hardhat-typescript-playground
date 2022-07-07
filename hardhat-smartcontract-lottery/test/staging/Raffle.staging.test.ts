import { expect, assert } from "chai"
import { BigNumber } from "ethers"
import { ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { Raffle } from "../../typechain-types"

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Staging Tests", function () {
      let raffle: Raffle
      let raffleEntranceFee: BigNumber
      let deployer: string

      this.beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract("Raffle", deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
      })

      describe("fulfillRandomWords", function () {
        it("Works with live Chainlink Keepers and Chainlink VRF; picks a random winner", async function () {
          const startingTimestamp = await raffle.getLatestTimestamp()

          await new Promise<void>(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              try {
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await (
                  await ethers.getSigner(recentWinner)
                ).getBalance()
                const endingTimeStamp = await raffle.getLatestTimestamp()

                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(
                  recentWinner.toString(),
                  (await ethers.getSigners())[0].address
                )
                assert.equal(raffleState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                )
                assert(endingTimeStamp > startingTimestamp)

                resolve()
              } catch (error) {
                reject(error)
              }
            })

            await raffle.enterRaffle({ value: raffleEntranceFee })
            const winnerStartingBalance = await (
              await ethers.getSigner(deployer)
            ).getBalance()
          })
        })
      })
    })
