import { WalletConnectContext } from "components/WalletConnectContext";
import { useContext } from "react";

export default function useWalletConnectContext() {
    return useContext(WalletConnectContext)
}