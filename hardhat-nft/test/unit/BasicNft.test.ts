import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import deploy from "../../scripts/deploy"

describe("BasicNft", function () {
  async function DeployBasicNftFixture() {
    return await deploy()
  }

  describe("constructor", function () {
    it("Sets the name and symbol", async function () {
      const { basicNft } = await loadFixture(DeployBasicNftFixture)

      expect(await basicNft.name()).to.equal("Dogie")
      expect(await basicNft.symbol()).to.equal("DOG")
    })
  })

  describe("mintNft", function () {
    it("Mints an NFT", async function () {
      const { basicNft, deployer } = await loadFixture(DeployBasicNftFixture)

      await basicNft.mintNft()
      expect(await basicNft.ownerOf("0")).to.equal(deployer.address)
    })

    it("Increments the token counter", async function () {
      const { basicNft } = await loadFixture(DeployBasicNftFixture)

      await basicNft.mintNft()
      expect(await basicNft.getTokenCounter()).to.equal(1)
    })
  })
})
