import pinataSDK from "@pinata/sdk"
import path from "path"
import fs from "fs"

const pinataApiKey = process.env.PINATA_API_KEY!
const pinataApiSecret = process.env.PINATA_API_SECRET!
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath: string) {
  const fullImagesPath = path.resolve(imagesFilePath) // returns absolute path
  const files = fs.readdirSync(fullImagesPath) // returns array with names

  let responses = []
  for (const fileIndex in files) {
    console.log(`Pinning ${files[fileIndex]}...`)
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    )
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile)
      responses.push(response)
      // console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  return { responses, files }
}

async function storeTokenUriMetadata(metadata: object) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata)
    return response
  } catch (error) {
    console.log(error)
  }
}

export { storeImages, storeTokenUriMetadata }
