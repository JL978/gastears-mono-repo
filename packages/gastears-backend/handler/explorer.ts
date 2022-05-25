import axios from "axios"
import { Chains, ExplorerResponse, Transaction, WalletAddress } from "../types"

type ChainToApiKey = {
  [Chain in Chains]?: string
}

type ChainToApiEndpointUrl = {
  [Chain in Chains]?: string
}

const CHAIN_TO_API_KEY_MAP: ChainToApiKey = {
  "avalanche-2": process.env.SNOWTRACE_API_KEY,
  "binancecoin": process.env.BSCSCAN_API_KEY,
  "ethereum": process.env.ETHERSCAN_API_KEY,
  "fantom": process.env.FTMSCAN_API_KEY,
  "matic-network": process.env.POLYGONSCAN_API_KEY,
  "hoo-token": process.env.HOOSCAN_API_KEY
}

const CHAIN_TO_API_ENDPOINT_URL: ChainToApiEndpointUrl = {
  "avalanche-2": "https://api.snowtrace.io/api",
  "binancecoin": "https://api.bscscan.com/api",
  "ethereum": "https://api.etherscan.io/api",
  "fantom": "https://api.ftmscan.com/api",
  "matic-network": "https://api.polygonscan.com/api",
  "hoo-token": "https://api.hooscan.com/api"
}

export default async function getExplorerResponse(
  addresses: WalletAddress[]
) {
  const chains: Chains[] = ["avalanche-2", "binancecoin", "ethereum", "fantom", "matic-network", "hoo-token"];
  const result: ExplorerResponse = {
    "avalanche-2": {},
    "binancecoin": {},
    "ethereum": {},
    "fantom": {},
    "matic-network": {},
    "hoo-token": {}
  }

  await Promise.all(chains.map(async (chain: Chains) => {
    const allTransactions = await Promise.all(addresses.map((address: string) => getAllTransactions(address, chain)))
    addresses.forEach((address: string, index: number) => {
      result[chain][address] = allTransactions[index]
    })
  }))

  return result
}

const getAllTransactions = (address: string, chain: Chains) => {
  return new Promise<Transaction[]>(async (resolve, reject) => {
    const url = CHAIN_TO_API_ENDPOINT_URL[chain]?.concat(`?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&sort=asc&apikey=${CHAIN_TO_API_KEY_MAP[chain]}`)

    const res = await axios.get(url || "")
    const data = res.data

    // Return early if there was error with api query, don't want to reject because that will fail the Promise.all
    if (data.status !== "1") resolve(data)

    let resultTransactions = data.result
    let rawTotalTransactions = resultTransactions

    while (resultTransactions.length === 10000) { //10,000 is the max result the api will return
      const prevLastBlock = resultTransactions[resultTransactions.length - 1].blockNumber
      const url = CHAIN_TO_API_ENDPOINT_URL[chain]?.concat(`?module=account&action=txlist&address=${address}&startblock=${prevLastBlock}&endblock=99999999&page=1&sort=asc&apikey=${CHAIN_TO_API_KEY_MAP[chain]}`)

      const res = await axios.get(url || "")
      const data = res.data

      // Return early if there was error with api query, don't want to reject because that will fail the Promise.all
      if (data.status !== "1") resolve(data)
      resultTransactions = data.result
      rawTotalTransactions = rawTotalTransactions.concat(resultTransactions)
    }

    const totalTransactions = rawTotalTransactions
      .map((transaction: Transaction) => {
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