import useWalletConnectContext from 'hooks/useWalletConnectContext'
import React from 'react'
import Button from './Button'

const ConnectWalletButton = () => {
    const { connectedWallets, getWallets } = useWalletConnectContext()

    return (
        <Button
            primary
            rounded
            onClick={() => getWallets()}
            disabled={connectedWallets.length > 0}
        >
            {connectedWallets.length > 0 ? "Connected" : "Connect Wallet"}
        </Button>
    )
}

export default ConnectWalletButton