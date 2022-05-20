import Button from 'components/Button/Button'
import ContentContainer from 'components/layouts/ContentContainer'
import PageContainer from 'components/layouts/PageContainer'
import { WalletConnectContext } from "components/WalletConnectContext"
import type { NextPage } from 'next'
import { useContext } from "react"
import GasTears from "../public/gastears.svg"
import FooterContent from 'components/FooterContent'

const Home: NextPage = () => {
  const { getWallets, connectedWallets } = useContext(WalletConnectContext)

  return (
    <PageContainer isFirstPage>
      <ContentContainer>
        <div className="searchPageTopBar">
          <div className="logo">
            <h1>GasTears</h1>
          </div>
          <Button
            primary
            rounded
            onClick={() => getWallets()}
            disabled={connectedWallets.length > 0}
          >
            {connectedWallets.length > 0 ? "Connected" : "Connect Wallet"}
          </Button>
        </div>
      </ContentContainer>
      <div className="searchPageLogoArea">
        <GasTears className="logoSvg" />
      </div>
      <div className="searchPageMainArea">
        <h1>GasTears X HSC</h1>
      </div>
      <FooterContent />
    </PageContainer>
  )
}

export default Home
