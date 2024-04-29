import { PublicKey } from '@solana/web3.js';

export interface GetPoolFeesResponse {
  platformFee: number;
  referralFee: number;
  swapFee: number;
}

export interface GetFeeRecipientsResponse {
  user: PublicKey;
  percentage: number;
}

export interface PoolTokenAccounts {
  poolShareTokenAccount: PublicKey;
  poolAssetTokenAccount: PublicKey;
}

export interface PoolTokenBalances {
  poolShareTokenBalance: string;
  poolAssetTokenBalance: string;
}

export interface CreatorTokenBalances {
  creatorShareTokenBalance: string;
  creatorAssetTokenBalance: string;
}

export interface GetUserTokenBalanceParams {
  poolPda: PublicKey;
  userPublicKey: PublicKey;
}

export interface UserPoolStateBalances {
  purchasedShares: string;
  redeemedShares: string;
  referredAssets: string;
}
