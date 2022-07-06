import type { NextApiRequest, NextApiResponse } from 'next'
import { Chains, ExplorerResponse, Transaction } from "types"
import { GasClaimInterface } from 'gas-claim-contract'
import { ethers } from "ethers"

type ChainToApiKey = Record<Chains, string>

type ChainToApiEndpointUrl = Record<Chains, string>

const CHAIN_TO_API_KEY_MAP: ChainToApiKey = {
  "avalanche-2": process.env.SNOWTRACE_API_KEY!,
  "binancecoin": process.env.BSCSCAN_API_KEY!,
  "ethereum": process.env.ETHERSCAN_API_KEY!,
  "fantom": process.env.FTMSCAN_API_KEY!,
  "matic-network": process.env.POLYGONSCAN_API_KEY!,
  "hoo-token": process.env.HOOSCAN_API_KEY!
}

const CHAIN_TO_API_ENDPOINT_URL: ChainToApiEndpointUrl = {
  "avalanche-2": "https://api.snowtrace.io/api",
  "binancecoin": "https://api.bscscan.com/api",
  "ethereum": "https://api.etherscan.io/api",
  "fantom": "https://api.ftmscan.com/api",
  "matic-network": "https://api.polygonscan.com/api",
  "hoo-token": "https://api.hooscan.com/api"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExplorerResponse>
) {
  // const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!)
  const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
  const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_GAS_CLAIM_CONTRACT_ADDRESS!,
      GasClaimInterface.abi,
      signer
  )

  const { addresses } = JSON.parse(req.body)

  const allAddressTransactions = await Promise.all(addresses.map(async (address : string) => {
    return getAllTransactions(address, "hoo-token")
  })) 

  const result  = allAddressTransactions.reduce((res, addressTransaction, index) => {
    res[addresses[index]] = addressTransaction
    return res
  }, {})

  res.status(200).json(result)
}

const getAllTransactions = (address: string, chain: Chains) => {
  return new Promise(async (resolve, reject) => {
    const url = CHAIN_TO_API_ENDPOINT_URL[chain]?.concat(`?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&sort=asc&apikey=${CHAIN_TO_API_KEY_MAP[chain]}`)

    const res = await fetch(url || "")
    const resJSON = await res.json()

    // Return early if there was error with api query, don't want to reject because that will fail the Promise.all
    if (resJSON.status !== "1") resolve(resJSON)

    let resultTransactions = resJSON.result
    let rawTotalTransactions = resultTransactions

    while (resultTransactions.length === 10000) { //10,000 is the max result the api will return
      const prevLastBlock = resultTransactions[resultTransactions.length - 1].blockNumber
      const url = CHAIN_TO_API_ENDPOINT_URL[chain]?.concat(`?module=account&action=txlist&address=${address}&startblock=${prevLastBlock}&endblock=99999999&page=1&sort=asc&apikey=${CHAIN_TO_API_KEY_MAP[chain]}`)

      const res = await fetch(url || "")
      const resJSON = await res.json()

      // Return early if there was error with api query, don't want to reject because that will fail the Promise.all
      if (resJSON.status !== "1") resolve(resJSON)
      resultTransactions = resJSON.result
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: false,
    },
  },
}