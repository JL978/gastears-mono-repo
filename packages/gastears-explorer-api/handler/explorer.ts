import axios from "axios"
import { allSupportedChains } from "../global"
import { Chains, ChainsConfigObject, ExplorerResponse, Transaction, WalletAddress } from "../types"

const CHAIN_TO_API_KEY_MAP: ChainsConfigObject = {
  "avalanche-2": process.env.SNOWTRACE_API_KEY,
  "binancecoin": process.env.BSCSCAN_API_KEY,
  "ethereum": process.env.ETHERSCAN_API_KEY,
  "fantom": process.env.FTMSCAN_API_KEY,
  "matic-network": process.env.POLYGONSCAN_API_KEY,
  "hoo-token": process.env.HOOSCAN_API_KEY
}

const CHAIN_TO_API_ENDPOINT_URL: ChainsConfigObject = {
  "avalanche-2": "https://api.snowtrace.io/api",
  "binancecoin": "https://api.bscscan.com/api",
  "ethereum": "https://api.etherscan.io/api",
  "fantom": "https://api.ftmscan.com/api",
  "matic-network": "https://api.polygonscan.com/api",
  "hoo-token": "https://api.hooscan.com/api"
}

export default async function getExplorerResponse(
  addresses: WalletAddress[],
  chains?: Chains[]
) {
  const result: ExplorerResponse = {
    "avalanche-2": {},
    "binancecoin": {},
    "ethereum": {},
    "fantom": {},
    "matic-network": {},
    "hoo-token": {}
  }

  const chainsToFetch = chains || allSupportedChains
  const promises = chainsToFetch
    .map(async (chain) => {
      const addressTransactionsPromises = addresses.map((address) => getWalletTransactionsOnChain(address, chain))
      const allTransactions = await Promise.all(addressTransactionsPromises)
      addresses.forEach((address, index) => {
        result[chain][address] = allTransactions[index]
      })
    })

  await Promise.all(promises)
  return result
}

const getWalletTransactionsOnChain = (address: WalletAddress, chain: Chains) => {
  const baseUrl = CHAIN_TO_API_ENDPOINT_URL[chain]
  const chainApiKey = CHAIN_TO_API_KEY_MAP[chain]

  return new Promise<Transaction[]>(async (resolve, reject) => {
    async function getData(params: string): Promise<Transaction[]> {
      const url = baseUrl + params
      const res = await axios.get(url)
      const data = res.data

      // Return early if there was error with api query, 
      // don't want to reject because that will fail the Promise.all
      if (data.status !== "1") resolve(data)
      return data.result
    }

    let resultTransactions = await getData(
      `?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&sort=asc&apikey=${chainApiKey}`
    )
    let rawTotalTransactions = resultTransactions

    //10,000 is the max result length the api will return
    while (resultTransactions.length === 10000) {
      const prevLastBlock = resultTransactions.at(-1).blockNumber
      resultTransactions = await getData(
        `?module=account&action=txlist&address=${address}&startblock=${prevLastBlock}&endblock=99999999&page=1&sort=asc&apikey=${chainApiKey}`
      )
      rawTotalTransactions = rawTotalTransactions.concat(resultTransactions)
    }

    const totalTransactions = rawTotalTransactions
      .map((transaction) => {
        return {
          timeStamp: transaction.timeStamp,
          hash: transaction.hash,
          from: transaction.from,
          gasPrice: transaction.gasPrice,
          isError: transaction.isError,
          gasUsed: transaction.gasUsed
        }
      })

    resolve(totalTransactions)
  })
}