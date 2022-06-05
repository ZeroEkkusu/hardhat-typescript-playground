const ethers = require("ethers")
const fs = require("fs")
require("dotenv").config()

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  /*const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf8")
  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedJson,
    process.env.PRIVATE_KEY_PASSWORD
  )
  wallet = await wallet.connect(provider)*/

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  )

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet)
  console.log("Deploying...")
  const contract = await contractFactory.deploy(/*{ chainId: 1337 }*/)
  // const deploymentReceipt = await contract.deployTransaction.wait(1);
  /*const tx = {
    nonce: wallet.getTransactionCount(),
    gasPrice: 20000000000,
    gasLimit: 1000000,
    to: null,
    value: 0,
    data: "0x...",
    chainId: 1337,
  }

  // const signedTransactionData = await wallet.signTransaction(tx);
  // console.log(signedTransactionData);
  const sentTransactionReceipt = await (
    await wallet.sendTransaction(tx)
  ).wait(1)
  const contract = new ethers.Contract(
    sentTransactionReceipt.contractAddress,
    abi,
    wallet
  )*/

  const transactionResponse = await contract.store("78") // contract["store(uint256)"]
  // const transactionReceipt = await transactionResponse.wait(1)
  const favoriteNumber = await contract.retrieve()
  console.log(`Favorite Number: ${favoriteNumber.toString()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
