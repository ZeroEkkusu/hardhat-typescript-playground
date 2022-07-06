import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", function () {
      let raffle: Raffle
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
      let raffleEntranceFee: BigNumber
      let deployer: string
      let interval: BigNumber

      this.beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        )
        raffle = await ethers.getContract("Raffle", deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
        interval = await raffle.getInterval()
      })

      describe("constructor", async function () {
        it("Initializes the raffle correctly", async function () {
          const raffleState = await raffle.getRaffleState()
          const interval = await raffle.getInterval()
          assert.equal(raffleState.toString(), "0")
          assert.equal(interval.toString(), "30")
        })
      })

      describe("enterRaffle", function () {
        it("Reverts when you don't pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle__NotEnoughETHEntered"
          )
        })

        it("Records players when they enter", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          const playerFromContract = await raffle.getPlayer(0)

          assert.equal(playerFromContract, deployer)
        })

        it("Emit an event on enter", async function () {
          await expect(raffle.enterRaffle({ value: raffleEntranceFee }))
            .to.emit(raffle, "RaffleEnter")
            .withArgs(deployer)
        })

        it("Does not allow entrance when raffle is calculating", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", []) // await network.provider.request({ method: "evm_mine", params: [] })
          await raffle.performUpkeep([])

          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWith("Raffle__NotOpen")
        })
      })

      describe("checkUpkeep", function () {
        it("Returns false if people haven't sent any ETH", async function () {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })

        it("Returns a false if raffle isn't open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep("0x")
          const raffleState = await raffle.getRaffleState()
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")

          assert(!upkeepNeeded)
          assert.equal(raffleState, 1)
        })

        it("returns false if enough time hasn't passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() - 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
          assert(!upkeepNeeded)
        })

        it("returns true if enough time has passed, has players, eth, and is open", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
          assert(upkeepNeeded)
        })
      })

      describe("performUpkeep", function () {
        it("Can run only if checkUpkeep returns true", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep("0x")
          // throws assuming `throwOnTransactionFailures` is `true`
        })

        it("Revert when checkUpkeep is false", async function () {
          await expect(raffle.performUpkeep("0x")).to.be.revertedWith(
            `Raffle__UpkeepNotNeeded(0, 0, 0)`
          )
        })

        it("Updates the raffle state, emits an event, and calls the VRF Coordinator", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
          const txResponse = await raffle.performUpkeep("0x")
          const txReceipt = await txResponse.wait(1)
          const requestId: BigNumber = txReceipt.events![1].args!.requestId
          const raffleState = await raffle.getRaffleState()

          assert(requestId.toNumber() > 0)
          assert.equal(raffleState, 1)
        })
      })

      describe("fulfillRandomWords", function () {
        this.beforeEach(async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
        })

        it("Picks a winner, sends the money, and resets the lottery", async function () {
          const additionalEntrants = 3
          const startingAccountIndex = 1
          const accounts = await ethers.getSigners()
          for (
            let i = startingAccountIndex;
            i < startingAccountIndex + additionalEntrants;
            i++
          ) {
            const raffleAsAccount = raffle.connect(accounts[i])
            await raffleAsAccount.enterRaffle({ value: raffleEntranceFee })
          }
          const startingTimestamp = await raffle.getLatestTimestamp()

          await new Promise<void>(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              try {
                const recentWinner = await raffle.getRecentWinner()
                const winnerEndingBalance = await (
                  await ethers.getSigner(recentWinner)
                ).getBalance()
                const raffleState = await raffle.getRaffleState()
                const endingTimeStamp = await raffle.getLatestTimestamp()
                const numOfPlayer = await raffle.getNumPlayers()

                assert.equal(numOfPlayer.toString(), "0")
                assert.equal(raffleState, 0)
                assert(endingTimeStamp > startingTimestamp)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance
                    .add(
                      raffleEntranceFee
                        .mul(additionalEntrants)
                        .add(raffleEntranceFee)
                    )
                    .toString()
                )
              } catch (e: any) {
                reject()
              }
              resolve()
            })

            const tx = await raffle.performUpkeep("0x")
            const txReceipt = await tx.wait(1)
            // I know who the winner will be
            const winnerStartingBalance = await accounts[1].getBalance()
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events![1].args!.requestId,
              raffle.address
            )
          })
        })
      })
    })
