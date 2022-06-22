// cannot use `require`
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (windowEthereumExists) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      connectButton.innerHTML = "Connected"
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      console.log(accounts)
    } catch (error) {
      console.log(error)
    }
  } else {
    connectButton.innerHTML = "No wallet"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  if (ethAmount === "") return
  if (windowEthereumExists) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMined(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}

async function getBalance() {
  if (windowEthereumExists) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

function listenForTransactionMined(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash} ...`)
  return new Promise((resolve, reject) => {
    // listens for the first occurance of an Ethers `event`
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
}

async function withdraw() {
  if (windowEthereumExists) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMined(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}

function windowEthereumExists() {
  return typeof window.ethereum !== "undefined"
}
