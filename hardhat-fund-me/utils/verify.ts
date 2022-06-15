import { run } from "hardhat"

const verify = async function (contractAddress: string, args: any[]) {
  console.log("Verifying...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Info: Already verified")
    } else {
      console.log(e)
    }
  }
}

export default verify
