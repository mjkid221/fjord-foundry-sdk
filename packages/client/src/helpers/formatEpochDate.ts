import { BN } from '@project-serum/anchor';

export const formatEpochDate = (epoch: BN): string => {
  return new Date(epoch.toNumber() * 1000).toLocaleString();
};
