interface networkConfigItem {
  wrappedCoin?: string
  lendingPoolAddressProvider?: string
  lendingPool?: string
}

interface networkConfigInfo {
  [key: string]: networkConfigItem
}

const networkConfig: networkConfigInfo = {
  hardhat: {
    wrappedCoin: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    lendingPoolAddressProvider: "0xd05e3E715d945B59290df0ae8eF85c1BdB684744",
    lendingPool: "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
  },
  mumbai: {
    wrappedCoin: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
  },
}

export { networkConfig }
