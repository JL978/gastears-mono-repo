import Button from 'components/Button/Button'
import ContentContainer from 'components/layouts/ContentContainer'
import PageContainer from 'components/layouts/PageContainer'
import type { NextPage } from 'next'
import { useEffect, useState } from "react"
import GasTears from "../public/gastears.svg"
import FooterContent from 'components/FooterContent'
import useGasClaimContract from 'hooks/useGasClaimContract'
import ConnectWalletButton from 'components/Button/ConnectWalletButton'
import { initExplorerResponse } from 'utils/Common'
import { ExplorerResponse } from 'types'
import useWalletConnectContext from 'hooks/useWalletConnectContext'

const Home: NextPage = () => {
  const { connectedWallets } = useWalletConnectContext()
  const [chainToAddressMap, setChainToAddressMap] = useState<ExplorerResponse>(() => initExplorerResponse())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (connectedWallets.length === 0) return
    const getTransactions = async () => {
      setIsLoading(true)

      const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_API_LOCAL_URL || process.env.NEXT_PUBLIC_EXPLORER_API_URL || ""
      // const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_API_URL || "" //uncomment to test with the prod api
      const apiRes = await fetch(EXPLORER_URL, {
        method: "POST",
        body: JSON.stringify({
          addresses: [connectedWallets[0]],
          chains: ["hoo-token"]
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      })
      const apiJSON = await apiRes.json()
      setIsLoading(false)
      console.log(apiJSON)
      setChainToAddressMap(apiJSON)
    }
    getTransactions()
  }, [connectedWallets])
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
