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

export interface GetPoolWeightsAndReserves {
  poolPda: PublicKey;
}

export interface UserPoolStateBalances {
  purchasedShares: string;
  redeemedShares: string;
  referredAssets: string;
}

export interface PoolReservesAndWeights {
  assetReserve: string;
  shareReserve: string;
  assetWeight: string;
  shareWeight: string;
}

export const ReservesAndWeightSchema = {
  struct: {
    asset_reserve: 'u64',
    share_reserve: 'u64',
    asset_weight: 'u64',
    share_weight: 'u64',
  },
};

export interface PoolReservesAndWeightsResponse {
  asset_reserve: bigint;
  share_reserve: bigint;
  asset_weight: bigint;
  share_weight: bigint;
}
