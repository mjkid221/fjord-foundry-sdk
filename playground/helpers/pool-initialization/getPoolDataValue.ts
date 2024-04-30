import { GetSinglePoolDataValueParams } from '@/types';

export const getPoolDataValue = async ({ poolPda, sdkClient, valueKey }: GetSinglePoolDataValueParams) => {
  return await sdkClient.retrieveSinglePoolDataValue({ poolPda, valueKey });
};
