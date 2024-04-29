import * as anchor from '@coral-xyz/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export type BigNumber = anchor.BN;
/**
 * Defines the public keys required for initializing a new LBP pool.
 *
 * @property {PublicKey} creator - The public key of the wallet creating the pool.
 * @property {PublicKey} shareTokenMint - The public key of the mint for the pool's share tokens.
 * @property {PublicKey} assetTokenMint - The public key of the mint for the pool's underlying asset.
 */
export interface InitializePoolPublicKeys {
  keys: {
    creator: PublicKey;
    shareTokenMint: PublicKey;
    assetTokenMint: PublicKey;
  };
}

/**
 * Defines the configuration parameters for initializing a new LBP pool.
 *
 * @property {BigNumber} assets - The amount of asset tokens to be deposited into the pool.
 * @property {BigNumber} shares - The amount of share tokens to be minted for the pool.
 * @property {BigNumber} [virtualAssets] - (Optional) The amount of virtual assets (if used) to be deposited into the pool.
 * @property {BigNumber} [virtualShares] - (Optional) The amount of virtual shares (if used) to be minted for the pool.
 * @property {BigNumber} maxSharePrice -  The maximum price (in asset tokens) per share token during the LBP sale.
 * @property {BigNumber} maxSharesOut - The maximum number of share tokens that can be sold during the LBP sale.
 * @property {BigNumber} maxAssetsIn - The maximum amount of asset tokens that can be deposited during the LBP sale.
 * @property {number} startWeightBasisPoints - The starting weight of the asset in the pool, expressed in basis points (e.g., 1000 = 10%).
 * @property {number} endWeightBasisPoints - The ending weight of the asset token in the pool, expressed in basis points.
 * @property {BigNumber} saleStartTime - The Unix timestamp at which the LBP sale begins.
 * @property {BigNumber} saleEndTime - The Unix timestamp at which the LBP sale ends.
 * @property {BigNumber} [vestCliff] - (Optional) The Unix timestamp representing the start of the vesting cliff (if a vesting schedule is used).
 * @property {BigNumber} [vestEnd] - (Optional) The Unix timestamp representing the end of the vesting period (if a vesting schedule is used).
 * @property {number[]} [whitelistMerkleRoot] - (Optional) The Merkle root of a whitelist to restrict participation in the LBP sale.
 * @property {boolean} [sellingAllowed] - (Optional) Whether selling share tokens is allowed. Defaults to false.
 */
export type InitializePoolArgs = {
  args: {
    assets: BigNumber;
    shares: BigNumber;
    virtualAssets?: BigNumber;
    virtualShares?: BigNumber;
    maxSharePrice: BigNumber;
    maxSharesOut: BigNumber;
    maxAssetsIn: BigNumber;
    startWeightBasisPoints: number;
    endWeightBasisPoints: number;
    saleStartTime: BigNumber;
    saleEndTime: BigNumber;
    vestCliff?: BigNumber;
    vestEnd?: BigNumber;
    whitelistMerkleRoot?: number[];
    sellingAllowed?: boolean;
  };
};

/**
 * Combines the public keys and initialization arguments required for creating a new LBP pool.
 */
export interface InitializePoolParams extends InitializePoolPublicKeys, InitializePoolArgs {}

export interface CreatePoolClientParams extends InitializePoolParams {
  programId: PublicKey;
  provider: anchor.AnchorProvider;
}

export type Accounts = {
  creator: anchor.Address | undefined;
  shareTokenMint: anchor.Address | undefined;
  assetTokenMint: anchor.Address | undefined;
  poolShareTokenAccount: anchor.Address | undefined;
  poolAssetTokenAccount: anchor.Address | undefined;
  creatorShareTokenAccount: anchor.Address | undefined;
  creatorAssetTokenAccount: anchor.Address | undefined;
};

/**
 * Represents the response from the `initializePool` function.
 *
 * @property {TransactionInstruction} transactionInstruction - The constructed transaction instruction for initializing the LBP pool.
 * @property {PublicKey} poolPda - The pre-calculated Program Derived Address (PDA) of the LBP pool.
 */
export interface InitializePoolResponse {
  transactionInstruction: TransactionInstruction;
  poolPda: PublicKey;
}

export interface GetPoolDataResponse {
  assetToken: string;
  closed: string;
  creator: string;
  paused: string;
  endWeightBasisPoints: number;
  maxAssetsIn: string;
  maxSharePrice: string;
  maxSharesOut: string;
  saleEndTime: string;
  saleStartTime: string;
  sellingAllowed: string;
  shareToken: string;
  startWeightBasisPoints: number;
  totalPurchased: string;
  totalReferred: string;
  totalSwapFeesAsset: string;
  totalSwapFeesShare: string;
  vestCliff: string;
  vestEnd: string;
  virtualAssets: string;
  virtualShares: string;
  whitelistMerkleRoot: number[];
}
