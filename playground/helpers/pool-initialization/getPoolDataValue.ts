import { GetSinglePoolDataValueParams } from '@/types';

export const getPoolDataValue = async ({ poolPda, programId, sdkClient, valueKey }: GetSinglePoolDataValueParams) => {
  return await sdkClient.retrieveSinglePoolDataValue({ poolPda, programId, valueKey });
};
