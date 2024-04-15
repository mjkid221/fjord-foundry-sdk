import { GetPoolDataResponse } from '@fjord-foundry/solana-sdk-client';

import { GetPoolArgs } from '@/types';

export const getPoolArgs = async ({
  poolPda,
  programId,
  provider,
  sdkClient,
  connection,
}: GetPoolArgs): Promise<GetPoolDataResponse> => {
  const pool = await sdkClient.retrievePoolData({ poolPda, programId, provider, connection });

  return pool;
};
