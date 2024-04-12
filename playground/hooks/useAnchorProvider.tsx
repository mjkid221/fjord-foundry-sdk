import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';

export interface UseAnchorProvider {
  getAnchorProvider: () => Promise<AnchorProvider>;
}

export const useAnchorProvider = (): UseAnchorProvider => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const getAnchorProvider = async () => {
    if (!connection || !wallet) {
      throw new Error('Wallet not connected');
    }

    return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
  };

  return {
    getAnchorProvider,
  };
};
