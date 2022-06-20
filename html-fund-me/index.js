async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      document.getElementById("connectButton").innerHTML = "Connected"
      const accounts = await ethereum.request({ method: "eth_accounts" })
      console.log(accounts)
    } catch (error) {
      console.log(error)
    }
  } else {
    document.getElementById("connectButton").innerHTML = "No wallet"
  }
}
