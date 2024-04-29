import { PublicKey } from '@solana/web3.js';

export interface GetPoolFeesResponse {
  platformFee: number;
  referralFee: number;
  swapFee: number;
}

export interface GetFeeRecipientsResponse {
  feeRecipients: {
    user: PublicKey;
    percentage: number;
  };
}

export interface PoolTokenAccounts {
  poolShareTokenAccount: PublicKey;
  poolAssetTokenAccount: PublicKey;
}
