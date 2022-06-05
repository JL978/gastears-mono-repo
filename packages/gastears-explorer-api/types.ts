import { allSupportedChains } from "./global"
export interface Transaction {
    timeStamp: string,
    hash: string,
    from: string,
    gasPrice: string,
    isError: string,
    gasUsed: string,
    blockNumber?: string
}

export type WalletAddress = string

export type AddressToTransactionsMap = Record<WalletAddress, Transaction[]>
export type ExplorerResponse = Record<Chains, AddressToTransactionsMap>

export type Chains = typeof allSupportedChains[number]

export type ChainsConfigObject = Record<Chains, string>
