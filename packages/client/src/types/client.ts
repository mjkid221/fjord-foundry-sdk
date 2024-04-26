import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';

import { PoolDataValueKey } from '../enums';

export type ContractAddress = `0x${string}`;

/**
 * TODO: Refactor `ReadContractRequest` to use Solana requirements.
 */
export type ReadContractRequest = {
  contractAddress: ContractAddress;
  abi: any;
  args?: any[];
};
/**
 * TODO: Define the schema for the response of the `getContractArgsResponseSchema` method using Solana requirements.
 */
export const getContractArgsResponseSchema = z.object({
  asset: z.string(),
  share: z.string(),
  assets: z.bigint(),
  shares: z.bigint(),
  virtualAssets: z.bigint(),
  virtualShares: z.bigint(),
  weightStart: z.bigint(),
  weightEnd: z.bigint(),
  saleStart: z.bigint(),
  saleEnd: z.bigint(),
  totalPurchased: z.bigint(),
  maxSharePrice: z.bigint(),
});
export type GetContractArgsResponse = z.infer<typeof getContractArgsResponseSchema>;

export const getContractManagerAddressResponseSchema = z.string().refine((value) => value.startsWith('0x'), {
  message: 'Contract address must start with 0x',
});
export type GetContractManagerAddressResponse = z.infer<typeof getContractManagerAddressResponseSchema>;

export const getVestingStateResponseSchema = z.object({
  isVestingSharesEnabled: z.boolean(),
  vestCliffTimestamp: z.number().optional(),
  vestEndTimestamp: z.number().optional(),
});

export type GetVestingStateResponse = z.infer<typeof getVestingStateResponseSchema>;

export const getReservesAndWeightsResponseSchema = z.object({
  assetReserve: z.bigint(),
  shareReserve: z.bigint(),
  assetWeight: z.bigint(),
  shareWeight: z.bigint(),
});

export type GetReservesAndWeightsResponse = z.infer<typeof getReservesAndWeightsResponseSchema>;

export interface RetrievePoolDataParams {
  poolPda: PublicKey;
}

export interface RetrieveSinglePoolDataValueParams extends RetrievePoolDataParams {
  valueKey: PoolDataValueKey;
}
