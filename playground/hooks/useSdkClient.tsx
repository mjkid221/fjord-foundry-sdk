import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export interface UseSdkClient {
  createSolanaSdkClient: (solanaNetwork: WalletAdapterNetwork) => Promise<FjordClientSdk>;
}

export const useSolanaSdkClient = (useSolana = true): UseSdkClient => {
  const createSolanaSdkClient = async (solanaNetwork = WalletAdapterNetwork.Devnet) => {
    const network = useSolana ? solanaNetwork : undefined;
    return await FjordClientSdk.create(useSolana, network);
  };

  return {
    createSolanaSdkClient,
  };
};
