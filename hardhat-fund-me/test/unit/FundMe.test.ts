import { assert, expect } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain"

describe("FundMe", function () {
  let fundMe: FundMe
  let deployer: string
  let mockV3Aggregator: MockV3Aggregator
  const sendValue = ethers.utils.parseEther("1")

  this.beforeEach(async function () {
    // deploy fixtures using `hardhat-deploy`
    await deployments.fixture(["all"])
    deployer = (await getNamedAccounts()).deployer
    // a `hardhat-deploy` feature: gets the most recently deployed "FundMe" Ethers Contract
    // connect `deployer` to always be the sender
    fundMe = await ethers.getContract("FundMe", deployer)
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
  })

  describe("constructor", function () {
    it("Sets the aggregator addresses correctly", async function () {
      const response = await fundMe.getPriceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  describe("fund", function () {
    it("Fails if not send enough ether", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      )
    })

    it("Updates the amount funded data structure", async function () {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.getAddressToAmountFunded(deployer)
      assert.equal(response.toString(), sendValue.toString())
    })

    it("Adds funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.getFunder("0")
      assert.equal(response, deployer)
    })
  })

  describe("withdraw", function () {
    let attacker: string

    this.beforeEach(async function () {
      attacker = (await getNamedAccounts()).attacker
      await fundMe.fund({ value: sendValue })
    })

    it("Allows only the owner to withdraw", async function () {
      const fundMeAsAttacker = await ethers.getContract("FundMe", attacker)
      await expect(fundMeAsAttacker.withdraw()).to.be.revertedWith(
        "FundMe__NotOwner()"
      )
    })

    it("Can withdraw from a single funder", async function () {
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await ethers.provider.getBalance(deployer)

      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)

      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await ethers.provider.getBalance(deployer)

      assert.equal(endingFundMeBalance.toString(), "0")
      assert.equal(
        endingDeployerBalance.toString(),
        startingDeployerBalance
          .add(startingFundMeBalance)
          .sub(gasCost)
          .toString()
      )
    })

    it("Allows withdrawing with muliple funders", async function () {
      const accounts = await ethers.getSigners()
      for (let i = 1; i < 6; i++) {
        const fundMeAsUser = fundMe.connect(accounts[i])
        await fundMeAsUser.fund({ value: sendValue })
      }
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await ethers.provider.getBalance(deployer)

      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)

      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await ethers.provider.getBalance(deployer)

      assert.equal(endingFundMeBalance.toString(), "0")
      assert.equal(
        endingDeployerBalance.toString(),
        startingDeployerBalance
          .add(startingFundMeBalance)
          .sub(gasCost)
          .toString()
      )

      for (let i = 1; i < 6; i++) {
        expect(fundMe.getFunder(i.toString())).to.be.reverted

        const response = await fundMe.getAddressToAmountFunded(
          accounts[i].address
        )

        assert.equal(response.toString(), "0")
      }
    })
  })
})
