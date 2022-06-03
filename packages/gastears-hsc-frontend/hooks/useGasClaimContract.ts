import { useRef, useEffect } from "react"

import { GasClaimInterface } from 'gas-claim-contract'
import { ethers } from "ethers"

declare let window: any

export default function useGasClaimContract() {
    const GasClaimContractRef = useRef<ethers.Contract>()

    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            GasClaimContractRef.current = new ethers.Contract(
                process.env.NEXT_PUBLIC_GAS_CLAIM_CONTRACT_ADDRESS!,
                GasClaimInterface.abi,
                signer
            )
        } else {
            console.error("No metamask")
        }
    }, [])

    return GasClaimContractRef.current
}