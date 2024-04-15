import { FjordClientSdk, GetPoolDataResponse } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import { GetPoolArgs } from '@/types';

export const getPoolArgs = async ({ poolPda, programId, provider }: GetPoolArgs): Promise<GetPoolDataResponse> => {
  const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

  return await sdkClient.retrievePoolData({ poolPda, programId, provider });
};
