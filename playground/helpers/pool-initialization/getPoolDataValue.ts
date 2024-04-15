import { GetSinglePoolDataValueParams } from '@/types';

export const getPoolDataValue = async ({
  poolPda,
  programId,
  provider,
  sdkClient,
  connection,
  valueKey,
}: GetSinglePoolDataValueParams) => {
  return await sdkClient.retrieveSinglePoolDataValue({ poolPda, programId, provider, connection, valueKey });
};
