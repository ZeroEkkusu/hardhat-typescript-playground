import { ethers, network } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import deployMocks from "./deploy-mocks"
import { storeImages, storeTokenUriMetadata } from "../utils/uploadToPinata"
import verify from "../utils/verify"

const imagesFilePath = "./images/randomNft"

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Age",
      value: 0,
    },
  ],
}

const FUND_AMOUNT = ethers.utils.parseEther("10") // 10 LINK

export default async function () {
  const [deployer] = await ethers.getSigners()

  let tokenUris: [string, string, string] = [
    "ipfs://QmP6J9xFDUTeLCghSCSr9B3aneZC8mq1o588yfkVWyfVvL",
    "ipfs://QmPZ4kXUstXuEnmtyRYgATUtkEyYAWXfSGSKzcXAxe6vcY",
    "ipfs://QmetLnLh8Mym4VGgbTiiMryTBvF57CdydTwtq14pDCpwCb",
  ]

  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = (await handleTokenUris()) as [string, string, string]
  }

  let vrfCoordinatorV2Address: string, subscriptionId: string

  if (developmentChains.includes(network.name)) {
    const { vrfCoordinatorV2Mock } = await deployMocks()
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    const tx = await vrfCoordinatorV2Mock.createSubscription()
    const txReceipt = await tx.wait(1)
    subscriptionId = txReceipt.events![0].args!.subId.toString()
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
  } else {
    vrfCoordinatorV2Address = networkConfig[network.name].vrfCoordinatorV2!
    subscriptionId = networkConfig[network.name].subscriptionId!
  }

  const args: [
    string,
    string,
    string,
    string,
    [string, string, string],
    string
  ] = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[network.name].gasLane!,
    networkConfig[network.name].callbackGasLimit!,
    tokenUris,
    networkConfig[network.name].mintFee!,
  ]

  const RandomIpfsNft = await ethers.getContractFactory(
    "RandomIpfsNft",
    deployer
  )
  const randomIpfsNft = await RandomIpfsNft.deploy(...args)
  await randomIpfsNft.deployTransaction.wait(
    networkConfig[network.name].blockConfirmations || 1
  )

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(randomIpfsNft.address, args)
  }

  return { randomIpfsNft, deployer, vrfCoordinatorV2Address, subscriptionId }
}

async function handleTokenUris() {
  let tokenUris: string[] = []
  const { responses: imageUploadResponses, files } = await storeImages(
    imagesFilePath
  )
  for (const imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = metadataTemplate
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
    tokenUriMetadata.description = `A ${tokenUriMetadata.name} puppy.`
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
    const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
    tokenUris.push(`ipfs://${metadataUploadResponse!.IpfsHash}`)
  }
  console.log("Token URIs uploaded")
  console.log(tokenUris)

  return tokenUris
}
