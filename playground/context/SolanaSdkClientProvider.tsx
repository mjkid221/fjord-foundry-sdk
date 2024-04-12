import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider } from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import React, { useState, useEffect, ReactNode, useMemo } from 'react';

import { SolanaSdkClientContext } from './SolanaSdkClientContext';

export interface SolanaSdkClientProviderProps {
  children: ReactNode;
  solanaNetwork: WalletAdapterNetwork;
}

export const SolanaSdkClientProvider = ({ children, solanaNetwork }: SolanaSdkClientProviderProps) => {
  const [sdkClient, setSdkClient] = useState<FjordClientSdk>();
  const [provider, setProvider] = useState<AnchorProvider>();
  const createSolanaSdkClient = async (solanaNetwork = WalletAdapterNetwork.Devnet) => {
    const network = solanaNetwork;
    return await FjordClientSdk.create(true, network);
  };

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (!connection || !wallet) {
      return;
    }
    const getAnchorProvider = async () => {
      if (!connection || !wallet) {
        throw new Error('Wallet not connected');
      }

      return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    };
    const initialize = async () => {
      // Make it an async function

      const client = await createSolanaSdkClient();
      const anchorProvider = await getAnchorProvider();
      setSdkClient(client);
      setProvider(anchorProvider);
    };
    initialize();
  }, [connection, wallet]);

  const values: SolanaSdkClientContext = useMemo(() => {
    return {
      sdkClient,
      provider,
    };
  }, [sdkClient, provider]);
  return <SolanaSdkClientContext.Provider value={values}>{children}</SolanaSdkClientContext.Provider>;
};
