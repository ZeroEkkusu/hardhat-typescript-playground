// cannot use `require`
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
connectButton.onclick = connect
fundButton.onclick = fund

async function connect() {
  if (typeof window.ethereum !== "undefined") {
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
  const ethAmount = "1"
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      console.log(`Funding with ${ethAmount} ETH...`)
    } catch (error) {
      console.log(error)
    }
  }
}
