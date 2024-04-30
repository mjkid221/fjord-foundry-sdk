import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider } from '@coral-xyz/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import React, { useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

import { SolanaSdkClientContext } from './SolanaSdkClientContext';
import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { PublicKey } from '@solana/web3.js';

export interface SolanaSdkClientProviderProps {
  children: ReactNode;
  solanaNetwork: WalletAdapterNetwork;
}

const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

export const SolanaSdkClientProvider = ({ children, solanaNetwork }: SolanaSdkClientProviderProps) => {
  const [sdkClient, setSdkClient] = useState<FjordClientSdk>();
  const [provider, setProvider] = useState<AnchorProvider>();
  const createSolanaSdkClient = useCallback(async () => {
    const network = solanaNetwork;
    return await FjordClientSdk.create({
      solanaNetwork: network,
      programId: programAddressPublicKey,
      enableLogging: true,
    }); // enable logging
  }, [solanaNetwork]);

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (!connection) {
      return;
    }

    const initialize = async () => {
      try {
        const client = await createSolanaSdkClient();

        setSdkClient(client);
      } catch (error) {
        console.error('Error initializing Solana SDK:', error);
      }
    };
    initialize();
  }, [connection, createSolanaSdkClient]);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    const getAnchorProvider = async () => {
      if (!connection || !wallet) {
        throw new Error('Wallet not connected');
      }

      return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    };

    const initialize = async () => {
      const anchorProvider = await getAnchorProvider();

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
