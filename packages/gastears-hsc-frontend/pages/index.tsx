import Button from 'components/Button/Button'
import ContentContainer from 'components/layouts/ContentContainer'
import PageContainer from 'components/layouts/PageContainer'
import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from "react"
import GasTears from "../public/gastears.svg"
import FooterContent from 'components/FooterContent'
import useGasClaimContract from 'hooks/useGasClaimContract'
import ConnectWalletButton from 'components/Button/ConnectWalletButton'
import { initExplorerResponse } from 'utils/Common'
import { ExplorerResponse, Transaction } from 'types'
import useWalletConnectContext from 'hooks/useWalletConnectContext'

const Home: NextPage = () => {
  const { connectedWallets } = useWalletConnectContext()
  const [isLoading, setIsLoading] = useState(false)
  const [hooTransactions, setHooTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (connectedWallets.length === 0) return
    const getTransactions = async () => {
      setIsLoading(true)
      const connectedWallet = connectedWallets[0].toLowerCase()
      const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_API_LOCAL_URL || process.env.NEXT_PUBLIC_EXPLORER_API_URL || ""
      // const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_API_URL || "" //uncomment to test with the prod api
      const apiJSON = await fetch(EXPLORER_URL, {
        method: "POST",
        body: JSON.stringify({
          addresses: [connectedWallet],
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      })
      const apiResult: ExplorerResponse = await apiJSON.json()
      setIsLoading(false)
      const transactions = apiResult["hoo-token"][connectedWallet]
        .filter((transaction) => transaction.from === connectedWallet)
      setHooTransactions(transactions)
    }
    getTransactions()
  }, [connectedWallets])

  const totalGasUsed = hooTransactions
    .reduce((total, transaction) => {
      const transactionPrice = parseFloat(transaction.gasUsed) * parseFloat(transaction.gasPrice) * (0.000000001) ** 2
      return total + transactionPrice
    }, 0)

  // const contract = useGasClaimContract()

  // if (typeof window !== "undefined" && contract) {
  //   (async () => {
  //     console.log(await contract.availableFunds())
  //   })()
  // }

  return (
    <PageContainer isFirstPage>
      <ContentContainer>
        <div className="searchPageTopBar">
          <div className="logo">
            <h1>GasTears</h1>
          </div>
          <ConnectWalletButton />
        </div>
      </ContentContainer>
      <div className="searchPageLogoArea">
        <GasTears className="logoSvg" />
      </div>
      <div className="searchPageMainArea">
        <h1>GasTears X HSC</h1>
        <h3>You can claim: {totalGasUsed.toFixed(14)} HOO</h3>
        {connectedWallets.length === 0 ?
          <ConnectWalletButton />
          :
          <Button
            primary
            rounded
            onClick={() => null}
          >Claim</Button>
        }
      </div>
      <FooterContent />
    </PageContainer>
  )
}

export default Home
