import { create } from 'zustand';

interface ConnectedWalletAddressStore {
  connectedWalletAddress: string | undefined;
  setConnectedWalletAddress: (connectedWalletAddress: string | undefined) => void;
}

export const useConnectedWalletAddressStore = create<ConnectedWalletAddressStore>((set) => ({
  connectedWalletAddress: undefined,
  setConnectedWalletAddress: (connectedWalletAddress) => set({ connectedWalletAddress }),
}));
