import { GetPoolDataResponse } from '@fjord-foundry/solana-sdk-client';

import { GetPoolArgs } from '@/types';

export const getPoolArgs = async ({ poolPda, programId, sdkClient }: GetPoolArgs): Promise<GetPoolDataResponse> => {
  try {
    return await sdkClient.retrievePoolData({ poolPda, programId });
  } catch (error) {
    console.error(error);
    return {} as GetPoolDataResponse;
  }
};
