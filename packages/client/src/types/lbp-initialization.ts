import { Address, AnchorProvider, BN } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

/**
 * Defines the public keys required for initializing a new LBP pool.
 *
 * @property {PublicKey} creator - The public key of the wallet creating the pool.
 * @property {PublicKey} shareTokenMint - The public key of the mint for the pool's share tokens.
 * @property {PublicKey} assetTokenMint - The public key of the mint for the pool's underlying asset.
 */
export type InitializePoolPublicKeys = {
  keys: {
    creator: PublicKey;
    shareTokenMint: PublicKey;
    assetTokenMint: PublicKey;
  };
};

/**
 * Defines the public keys required for performing a buy or sell operation.
 *
 * @property {PublicKey} userPublicKey - The public key of the wallet performing the swap.
 * @property {PublicKey} creator - The public key of the wallet that created the pool.
 * @property {PublicKey} [referrer] - (Optional) The public key of the referrer (if applicable).
 * @property {PublicKey} shareTokenMint - The public key of the mint for the pool's share tokens.
 * @property {PublicKey} assetTokenMint - The public key of the mint for the pool's underlying asset.
 */
export type BuySellOperationPublicKeys = {
  keys: {
    userPublicKey: PublicKey;
    creator: PublicKey;
    referrer?: PublicKey;
    shareTokenMint: PublicKey;
    assetTokenMint: PublicKey;
  };
};

export type BuyOperationArgs = {
  args: {
    poolPda: PublicKey;
    sharesAmountOut: BN;
  };
};

export interface BuyOperationParams extends BuySellOperationPublicKeys, BuyOperationArgs {}

export interface CreateBuyInstructionClientParams extends BuyOperationParams {
  programId: PublicKey;
  provider: AnchorProvider;
}

/**
 * Defines the configuration parameters for initializing a new LBP pool.
 *
 * @property {BN} assets - The amount of asset tokens to be deposited into the pool.
 * @property {BN} shares - The amount of share tokens to be minted for the pool.
 * @property {BN} [virtualAssets] - (Optional) The amount of virtual assets (if used) to be deposited into the pool.
 * @property {BN} [virtualShares] - (Optional) The amount of virtual shares (if used) to be minted for the pool.
 * @property {BN} maxSharePrice -  The maximum price (in asset tokens) per share token during the LBP sale.
 * @property {BN} maxSharesOut - The maximum number of share tokens that can be sold during the LBP sale.
 * @property {BN} maxAssetsIn - The maximum amount of asset tokens that can be deposited during the LBP sale.
 * @property {number} startWeightBasisPoints - The starting weight of the asset in the pool, expressed in basis points (e.g., 1000 = 10%).
 * @property {number} endWeightBasisPoints - The ending weight of the asset token in the pool, expressed in basis points.
 * @property {BN} saleStartTime - The Unix timestamp at which the LBP sale begins.
 * @property {BN} saleEndTime - The Unix timestamp at which the LBP sale ends.
 * @property {BN} [vestCliff] - (Optional) The Unix timestamp representing the start of the vesting cliff (if a vesting schedule is used).
 * @property {BN} [vestEnd] - (Optional) The Unix timestamp representing the end of the vesting period (if a vesting schedule is used).
 * @property {number[]} [whitelistMerkleRoot] - (Optional) The Merkle root of a whitelist to restrict participation in the LBP sale.
 * @property {boolean} [sellingAllowed] - (Optional) Whether selling share tokens is allowed. Defaults to false.
 */
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

/**
 * Combines the public keys and initialization arguments required for creating a new LBP pool.
 */
export interface InitializePoolParams extends InitializePoolPublicKeys, InitializePoolArgs {}

export interface CreatePoolClientParams extends InitializePoolParams {
  programId: PublicKey;
  provider: AnchorProvider;
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
  creator: string;
  endWeightBasisPoints: number;
  maxAssetsIn: number;
  maxSharePrice: string;
  maxSharesOut: number;
  saleEndTime: string;
  saleStartTime: string;
  sellingAllowed: string;
  shareToken: string;
  startWeightBasisPoints: number;
  vestCliff: string;
  vestEnd: string;
  virtualAssets: string;
  virtualShares: string;
  whitelistMerkleRoot: number[];
}
