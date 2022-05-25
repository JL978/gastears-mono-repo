export interface Transaction {
    timeStamp: string,
    hash: string,
    from: string,
    gasPrice: string,
    isError: string,
    gasUsed: string,
}

export type WalletAddress = string

export type AddressToTransactionsMap = Record<WalletAddress, Transaction[]>
export type ExplorerResponse = Record<Chains, AddressToTransactionsMap>

export type Chains = "ethereum" | "binancecoin" | "fantom" | "matic-network" | "avalanche-2" | "hoo-token"

export type ChainTransactionExplorerUrls = Record<Chains, string>
