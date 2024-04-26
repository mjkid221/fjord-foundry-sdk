import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { Connection, PublicKey } from '@solana/web3.js';
import { z } from 'zod';
import { AnchorProvider } from '@coral-xyz/anchor';

export const closePoolArgsSchema = z.object({
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
    isReferred: z.boolean(),
  }),
});

export interface ClosePoolArgsType extends z.TypeOf<typeof closePoolArgsSchema> {}
export type ClosePoolParams = {
  formData: z.infer<typeof closePoolArgsSchema>;
  connection: Connection;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};
