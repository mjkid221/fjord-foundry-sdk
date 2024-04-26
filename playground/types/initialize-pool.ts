import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { z } from 'zod';

export const swapAssetsForSharesArgsSchema = z.object({
  args: z.object({
    userPublicKey: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'User must be a valid Solana public key' },
    ),
    creator: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Creator must be a valid Solana public key' },
    ),
    referrer: z.string().optional(),
    shareTokenMint: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Share Token Mint must be a valid Solana public key' },
    ),
    assetTokenMint: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Asset Token Mint must be a valid Solana public key' },
    ),
    poolPda: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Pool must be a valid Solana public key' },
    ),
    sharesAmountOut: z.string().optional(),
    assetsAmountIn: z.string().optional(),
  }),
});

// Validation for InitializePoolArgs
export const initializePoolArgsSchema = z.object({
  args: z.object({
    creator: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Creator must be a valid Solana public key' },
    ),
    shareTokenMint: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Share Token Mint must be a valid Solana public key' },
    ),
    assetTokenMint: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Asset Token Mint must be a valid Solana public key' },
    ),
    assets: z.string(), // Assuming BN can be represented as a number
    shares: z.string(),
    virtualAssets: z.string().optional(),
    virtualShares: z.string().optional(),
    maxSharePrice: z.string(),
    maxSharesOut: z.string(),
    maxAssetsIn: z.string(),
    startWeightBasisPoints: z.string(),
    endWeightBasisPoints: z.string(),
    saleStartTime: z.string(),
    saleEndTime: z.string(),
    vestCliff: z.string().optional(),
    vestEnd: z.string().optional(),
    whitelistMerkleRoot: z.array(z.string()).optional(),
    sellingAllowed: z.boolean().optional(),
  }),
});

export interface InitializePoolArgsType extends z.TypeOf<typeof initializePoolArgsSchema> {}
export interface SwapAssetsForSharesArgsType extends z.TypeOf<typeof swapAssetsForSharesArgsSchema> {}

export type SwapAssetsForSharesParams = {
  formData: z.infer<typeof swapAssetsForSharesArgsSchema>;
  connection: Connection;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};
