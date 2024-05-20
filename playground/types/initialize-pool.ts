import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { z } from 'zod';

const baseArgsSchema = z.object({
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
    // Define slippage, must be less than 30
    slippage: z.coerce
      .number()
      .refine((val) => val <= 30, { message: 'Slippage must be less than 30%' })
      .optional(),
  }),
});

export const swapAssetsForSharesArgsSchema = z.object({
  args: z.object({
    ...baseArgsSchema.shape.args.shape,
    sharesAmountOut: z.string().optional(),
    assetsAmountIn: z.string().optional(),
  }),
});

export const swapSharesForAssetsArgsSchema = z.object({
  args: z.object({
    ...baseArgsSchema.shape.args.shape,
    assetsAmountOut: z.string().optional(),
    sharesAmountIn: z.string().optional(),
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

type BaseParams = {
  connection: Connection;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};
export interface SwapAssetsForSharesParams extends BaseParams {
  formData: z.infer<typeof swapAssetsForSharesArgsSchema>;
}

export interface SwapSharesForAssetsParams extends BaseParams {
  formData: z.infer<typeof swapSharesForAssetsArgsSchema>;
}

export const nominateNewOwnerArgsSchema = z.object({
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
    newOwnerPublicKey: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'User must be a valid Solana public key' },
    ),
  }),
});

export const acceptOwnershipParamsSchema = z.object({
  args: z.object({
    newOwnerPublicKey: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Creator must be a valid Solana public key' },
    ),
  }),
});

export const newFeesSchema = z.object({
  platformFee: z.string().optional(),
  referralFee: z.string().optional(),
  swapFee: z.string().optional(),
  ownerPublicKey: z.string().refine(
    (val) => {
      try {
        return new PublicKey(val);
      } catch (error) {
        return false;
      }
    },
    { message: 'Owner must be a valid Solana public key' },
  ),
});

export const setTreasuryFeeRecipientsParamsSchema = z.object({
  swapFeeRecipient: z.string().refine(
    (val) => {
      try {
        return new PublicKey(val);
      } catch (error) {
        return false;
      }
    },
    { message: 'Swap Fee Recipient must be a valid Solana public key' },
  ),
  feeRecipients: z.array(
    z.object({
      feeRecipient: z.string().refine(
        (val) => {
          try {
            return new PublicKey(val);
          } catch (error) {
            return false;
          }
        },
        { message: 'Fee Recipient must be a valid Solana public key' },
      ),
      feePercentage: z.string(),
    }),
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
});

export type NominateNewOwnerParams = {
  formData: z.infer<typeof nominateNewOwnerArgsSchema>;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};

export type AcceptOwnershipParams = {
  formData: z.infer<typeof acceptOwnershipParamsSchema>;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};

export type SetNewPoolFeesParams = {
  formData: z.infer<typeof newFeesSchema>;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};

export type SetTreasuryFeeRecipientsParams = {
  formData: z.infer<typeof setTreasuryFeeRecipientsParamsSchema>;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};
