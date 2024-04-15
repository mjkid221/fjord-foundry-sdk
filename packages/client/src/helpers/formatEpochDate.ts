import { BN } from '@project-serum/anchor';

/**
 * Helper function to format a Solana epoch timestamp into a readable date string.
 * @param {BN} epochTimestamp - The Solana epoch timestamp (in seconds).
 * @returns {string} A formatted date and time string.
 */
export const formatEpochDate = (epochTimestamp: BN): string => {
  return new Date(epochTimestamp.toNumber() * 1000).toLocaleString();
};
