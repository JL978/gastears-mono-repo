import { GasClaimInterface } from 'gas-claim-contract'
import { ethers } from "ethers"

const GasClaimContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAS_CLAIM_CONTRACT_ADDRESS!, GasClaimInterface.abi)

export default GasClaimContract
