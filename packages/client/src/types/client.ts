import { z } from 'zod';

export type ContractAddress = `0x${string}`;

/**
 * TODO: Define the schema for the request and response of the `getContractArgsRequestSchema` method using Solana requirements.
 */
export const getContractArgsRequestSchema = z.object({
  contractAddress: z
    .string()
    .refine((value) => value.startsWith('0x'), {
      message: 'Contract address must start with 0x',
    })
    .transform((value) => `0x${value.slice(2)}`),
  abi: z.any(),
});
export type GetContractArgsRequest = z.infer<typeof getContractArgsRequestSchema>;

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
