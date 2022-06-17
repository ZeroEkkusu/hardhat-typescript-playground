import { ethers, getNamedAccounts, network } from "hardhat"
import { FundMe } from "../../typechain"
import { developmentChains } from "../../helper-hardhat-config"
import { assert } from "chai"

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe: FundMe
      let deployer: string
      const sendValue = ethers.utils.parseEther("1")

      this.beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("Allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert(endingBalance.toString(), "0")
      })
    })
