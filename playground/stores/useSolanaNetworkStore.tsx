import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { create } from 'zustand';

interface SolanaNetworkStore {
  solanaNetwork: WalletAdapterNetwork;
  setSolanaNetwork: (solanaNetwork: WalletAdapterNetwork) => void;
}

export const useSolanaNetworkStore = create<SolanaNetworkStore>((set) => ({
  solanaNetwork: WalletAdapterNetwork.Devnet,
  setSolanaNetwork: (solanaNetwork) => set({ solanaNetwork }),
}));
