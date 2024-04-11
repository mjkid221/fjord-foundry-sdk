import { Address, BN, Wallet } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

export type InitializePoolPublicKeys = {
  keys: {
    creator: PublicKey;
    shareTokenMint: PublicKey;
    assetTokenMint: PublicKey;
  };
};

export type InitializePoolArgs = {
  args: {
    assets: BN;
    shares: BN;
    virtualAssets?: BN;
    virtualShares?: BN;
    maxSharePrice: BN;
    maxSharesOut: BN;
    maxAssetsIn: BN;
    startWeightBasisPoints: number;
    endWeightBasisPoints: number;
    saleStartTime: BN;
    saleEndTime: BN;
    vestCliff?: BN;
    vestEnd?: BN;
    whitelistMerkleRoot?: number[];
    sellingAllowed?: boolean;
  };
};

export interface InitializePoolParams extends InitializePoolPublicKeys, InitializePoolArgs {
  programId: PublicKey;
}

export interface CreatePoolClientParams extends InitializePoolPublicKeys, InitializePoolArgs {
  programId: PublicKey;
  connection: Connection;
  wallet: Wallet;
}

export type Accounts = {
  creator: Address | undefined;
  shareTokenMint: Address | undefined;
  assetTokenMint: Address | undefined;
  poolShareTokenAccount: Address | undefined;
  poolAssetTokenAccount: Address | undefined;
  creatorShareTokenAccount: Address | undefined;
  creatorAssetTokenAccount: Address | undefined;
};
