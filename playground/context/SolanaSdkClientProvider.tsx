import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider } from '@coral-xyz/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import React, { useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

import { SolanaSdkClientContext } from './SolanaSdkClientContext';
import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { PublicKey } from '@solana/web3.js';
import { useConnectedWalletAddressStore } from '@/stores/useConnectedWalletAddressStore';
import { useSolanaNetworkStore } from '@/stores/useSolanaNetworkStore';

export interface SolanaSdkClientProviderProps {
  children: ReactNode;
  solanaNetwork: WalletAdapterNetwork;
}

const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

export const SolanaSdkClientProvider = ({ children, solanaNetwork }: SolanaSdkClientProviderProps) => {
  const [sdkClient, setSdkClient] = useState<FjordClientSdk>();
  const [provider, setProvider] = useState<AnchorProvider>();

  const setConnectedWalletAddress = useConnectedWalletAddressStore((state) => state.setConnectedWalletAddress);
  const setSolanaNetwork = useSolanaNetworkStore((state) => state.setSolanaNetwork);

  const createSolanaSdkClient = useCallback(async () => {
    const network = solanaNetwork;
    if (network !== WalletAdapterNetwork.Devnet) {
      setSolanaNetwork(network);
    }
    return await FjordClientSdk.create({
      solanaNetwork: network,
      programId: programAddressPublicKey,
      enableLogging: true,
      rpcUrl: 'https://devnet.helius-rpc.com/?api-key=ef8c270a-dce9-4069-92f5-cd687823d1d7',
    }); // enable logging
  }, [setSolanaNetwork, solanaNetwork]);

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
      setConnectedWalletAddress(undefined);
      return;
    }

    setConnectedWalletAddress(wallet?.publicKey?.toBase58());

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
  }, [connection, setConnectedWalletAddress, wallet]);

  const values: SolanaSdkClientContext = useMemo(() => {
    return {
      sdkClient,
      provider,
    };
  }, [sdkClient, provider]);

  return <SolanaSdkClientContext.Provider value={values}>{children}</SolanaSdkClientContext.Provider>;
};
