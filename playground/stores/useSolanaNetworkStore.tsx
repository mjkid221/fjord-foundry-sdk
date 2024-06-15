import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { create } from 'zustand';

interface SolanaNetworkStore {
  solanaNetwork: WalletAdapterNetwork;
  setSolanaNetwork: (solanaNetwork: WalletAdapterNetwork) => void;
}

export const useSolanaNetworkStore = create<SolanaNetworkStore>((set) => ({
  solanaNetwork: WalletAdapterNetwork.Mainnet,
  setSolanaNetwork: (solanaNetwork) => set({ solanaNetwork }),
}));
