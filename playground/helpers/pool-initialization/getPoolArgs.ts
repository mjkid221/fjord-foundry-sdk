import { FjordClientSdk, RetrievePoolDataParams } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export interface GetPoolArgs extends RetrievePoolDataParams {
  sdkClient: FjordClientSdk;
}

export const getPoolArgs = async ({ poolPda, programId, provider }: RetrievePoolDataParams) => {
  const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

  const poolArgs = await sdkClient.retrievePoolData({ poolPda, programId, provider });

  return poolArgs;
};
