import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

import { BigNumber } from './lbp-initialization';

/**
 * Defines the public keys required for performing a buy or sell operation.
 *
 * @property {PublicKey} userPublicKey - The public key of the wallet performing the swap.
 * @property {PublicKey} creator - The public key of the wallet that created the pool.
 * @property {PublicKey} [referrer] - (Optional) The public key of the referrer (if applicable).
 * @property {PublicKey} shareTokenMint - The public key of the mint for the pool's share tokens.
 * @property {PublicKey} assetTokenMint - The public key of the mint for the pool's underlying asset.
 */
export interface BuySellOperationPublicKeys {
  keys: {
    userPublicKey: PublicKey;
    creator: PublicKey;
    referrer?: PublicKey;
    shareTokenMint: PublicKey;
    assetTokenMint: PublicKey;
  };
}

/**
 * Arguments for a "swap exact shares" operation.
 * @property {PublicKey} poolPda - The Program Derived Address (PDA) of the pool.
 * @property {BigNumber} sharesAmountOut - The desired quantity of shares to receive.
 */
export interface SwapExactSharesForAssetsOperationArgs {
  args: {
    poolPda: PublicKey;
    sharesAmountOut: BigNumber;
  };
}

/**
 * Arguments for a "swap shares with exact assets" operation.
 * @property {PublicKey} poolPda - The Program Derived Address (PDA) of the pool.
 * @property {BigNumber} assetsAmountIn - The exact quantity of assets to use in the swap.
 */
export interface SwapSharesForExactAssetsOperationArgs {
  args: {
    poolPda: PublicKey;
    assetsAmountIn: BigNumber;
  };
}

export interface SwapExactSharesForAssetsOperationParams
  extends BuySellOperationPublicKeys,
    SwapExactSharesForAssetsOperationArgs {}

export interface SwapSharesForExactAssetsOperationParams
  extends BuySellOperationPublicKeys,
    SwapSharesForExactAssetsOperationArgs {}

export interface SwapExactSharesForAssetsInstructionClientParams extends SwapExactSharesForAssetsOperationParams {
  programId: PublicKey;
  provider: AnchorProvider;
}

export interface SwapSharesForExactAssetsInstructionClientParams extends SwapSharesForExactAssetsOperationParams {
  programId: PublicKey;
  provider: AnchorProvider;
}
