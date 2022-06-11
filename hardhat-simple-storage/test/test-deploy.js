const { ethers } = require("hardhat")
const { /*expect,*/ assert } = require("chai")

describe("SimpleStorage", function () {
  let simpleStorageFactory, simpleStorage

  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
    simpleStorage = await simpleStorageFactory.deploy()
  })

  it("Should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve()
    const expectedValue = "0"

    assert.equal(currentValue.toString(), expectedValue)
    // expect(currentValue).to.equal(expectedValue)
  })

  it("Should update when we call store", async function () {
    const expectedValue = "7"
    const transactionResponse = await simpleStorage.store(expectedValue)
    await transactionResponse.wait(1)

    const currentValue = await simpleStorage.retrieve()
    assert.equal(currentValue, expectedValue)
  })

  it("Should add the person's name and their favorite number to the list and map their favorite number", async function () {
    const expectedName = "PN"
    const expectedFavoriteNumber = "7"
    const transactionResponse = await simpleStorage.addPerson(
      expectedName,
      expectedFavoriteNumber
    )
    await transactionResponse.wait(1)

    const person = await simpleStorage.people("0")
    // const {name, favoriteNumber} = await simpleStorage.people("0")
    const mappedFavoriteNumber = await simpleStorage.nameToFavoriteNumber(
      expectedName
    )
    assert.equal(person.name, expectedName)
    assert.equal(person.favoriteNumber, expectedFavoriteNumber)
    assert.equal(mappedFavoriteNumber, expectedFavoriteNumber)
  })
})
