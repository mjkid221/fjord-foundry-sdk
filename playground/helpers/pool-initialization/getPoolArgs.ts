import { GetPoolDataResponse } from '@fjord-foundry/solana-sdk-client';

import { GetPoolArgs } from '@/types';

export const getPoolArgs = async ({
  poolPda,
  programId,
  sdkClient,
}: GetPoolArgs): Promise<GetPoolDataResponse> => {
  return await sdkClient.retrievePoolData({ poolPda, programId });
};
