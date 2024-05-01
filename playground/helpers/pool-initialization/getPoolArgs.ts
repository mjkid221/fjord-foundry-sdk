import { GetPoolDataResponse } from '@fjord-foundry/solana-sdk-client';

import { GetPoolArgs } from '@/types';

export const getPoolArgs = async ({ poolPda, sdkClient }: GetPoolArgs): Promise<GetPoolDataResponse> => {
  try {
    return await sdkClient.retrievePoolData({ poolPda });
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error as string);
  }
};
