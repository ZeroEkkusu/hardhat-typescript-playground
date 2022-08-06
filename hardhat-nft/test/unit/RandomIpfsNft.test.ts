import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import deployRandomIpfs from "../../scripts/deploy-random-ipfs"
import { RandomIpfsNft, VRFCoordinatorV2Mock } from "../../typechain-types"

// Tests are incomplete
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("RandomIpfsNft", () => {
      async function deployRandomIpfsNftFixture() {
        return await deployRandomIpfs()
      }

      let randomIpfsNft: RandomIpfsNft
      let deployer: SignerWithAddress
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
      let subscriptionId: string
      let MINT_FEE: BigNumber

      beforeEach(async () => {
        const {
          randomIpfsNft: randomIpfsNft_,
          deployer: deployer_,
          vrfCoordinatorV2Address,
          subscriptionId: subscriptionId_,
        } = await loadFixture(deployRandomIpfs)
        randomIpfsNft = randomIpfsNft_
        deployer = deployer_
        subscriptionId = subscriptionId_

        vrfCoordinatorV2Mock = await ethers.getContractAt(
          "VRFCoordinatorV2Mock",
          vrfCoordinatorV2Address,
          deployer
        )
        vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)

        MINT_FEE = await randomIpfsNft.getMintFee()
      })

      describe("requestNft", function () {
        it("Reverts if mint fee not paid", async () => {
          await expect(
            randomIpfsNft.requestNft()
          ).to.be.revertedWithCustomError(
            randomIpfsNft,
            "RandomIpfsNft__NeedMoreEth"
          )
        })

        it("Stores requestId and emits an event", async () => {
          const expectedRequestId = await randomIpfsNft.callStatic.requestNft({
            value: MINT_FEE,
          })

          await expect(randomIpfsNft.requestNft({ value: MINT_FEE }))
            .to.emit(randomIpfsNft, "NftRequested")
            .withArgs(expectedRequestId, deployer.address)

          assert.equal(
            await randomIpfsNft.requestIdToSender(expectedRequestId),
            deployer.address
          )
        })
      })

      describe("fulfillRandomWords", function () {
        it("Mints an NFT", async function () {
          const requestId = await randomIpfsNft.callStatic.requestNft({
            value: MINT_FEE,
          })
          await randomIpfsNft.requestNft({ value: MINT_FEE })

          await new Promise<void>(async (resolve, reject) => {
            randomIpfsNft.once("NftMinted", async () => {
              try {
                const tokenCounter = await randomIpfsNft.getTokenCounter()
                const tokenURI = await randomIpfsNft.tokenURI("0")
                const owner = await randomIpfsNft.ownerOf("0")

                assert.equal(tokenCounter.toString(), "1")
                assert(tokenURI.includes("ipfs://"))
                assert.equal(owner, deployer.address)
                resolve()
              } catch (e: any) {
                reject(e)
              }
            })

            await vrfCoordinatorV2Mock.fulfillRandomWords(
              requestId,
              randomIpfsNft.address
            )
          })
        })
      })
    })
