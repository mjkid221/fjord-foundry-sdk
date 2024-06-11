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
 * @property {BigNumber} sharesAmountIn - The set quantity of shares to spend.
 * @property {number} slippage - (Optional) The maximum slippage percentage allowed for the swap.
 */
export interface SwapExactSharesForAssetsOperationArgs {
  args: {
    poolPda: PublicKey;
    sharesAmountIn: BigNumber;
    expectedMinAssetsOut: BigNumber;
  };
}

/**
 * Arguments for a "swap shares with exact assets" operation.
 * @property {PublicKey} poolPda - The Program Derived Address (PDA) of the pool.
 * @property {BigNumber} assetsAmountOut - The desired quantity of assets to receive.
 * @property {number} slippage - (Optional) The maximum slippage percentage allowed for the swap.
 */
export interface SwapSharesForExactAssetsOperationArgs {
  args: {
    poolPda: PublicKey;
    assetsAmountOut: BigNumber;
    expectedMaxSharesIn: BigNumber;
  };
}

/**
 * Arguments for a "swap exact assets for shares" operation.
 * @property {PublicKey} poolPda - The Program Derived Address (PDA) of the pool.
 * @property {BigNumber} assetsAmountIn - The set quantity of assets to swap for share token.
 * @property {number} slippage - (Optional) The maximum slippage percentage allowed for the swap.
 */
export interface SwapExactAssetsForSharesOperationArgs {
  args: {
    poolPda: PublicKey;
    assetsAmountIn: BigNumber;
    expectedSharesOut: BigNumber;
  };
}

/**
 * Arguments for a "swap assets with exact shares" operation.
 * @property {PublicKey} poolPda - The Program Derived Address (PDA) of the pool.
 * @property {BigNumber} sharesAmountOut - The desired quantity of shares to receive.
 * @property {number} slippage - (Optional) The maximum slippage percentage allowed for the swap.
 */
export interface SwapAssetsForExactSharesOperationArgs {
  args: {
    poolPda: PublicKey;
    sharesAmountOut: BigNumber;
    expectedAssetsIn: BigNumber;
  };
}

// Sell
export interface SwapSharesForExactAssetsOperationParams
  extends BuySellOperationPublicKeys,
    SwapSharesForExactAssetsOperationArgs {}
export interface SwapExactSharesForAssetsOperationParams
  extends BuySellOperationPublicKeys,
    SwapExactSharesForAssetsOperationArgs {}
export interface SwapSharesForExactAssetsInstructionClientParams extends SwapSharesForExactAssetsOperationParams {
  provider: AnchorProvider;
}
export interface SwapExactSharesForAssetsInstructionClientParams extends SwapExactSharesForAssetsOperationParams {
  provider: AnchorProvider;
}

// Buy
export interface SwapAssetsForExactSharesOperationParams
  extends BuySellOperationPublicKeys,
    SwapAssetsForExactSharesOperationArgs {}
export interface SwapExactAssetsForSharesOperationParams
  extends BuySellOperationPublicKeys,
    SwapExactAssetsForSharesOperationArgs {}
export interface SwapAssetsForExactSharesInstructionClientParams extends SwapAssetsForExactSharesOperationParams {
  provider: AnchorProvider;
}
export interface SwapExactAssetsForSharesInstructionClientParams extends SwapExactAssetsForSharesOperationParams {
  provider: AnchorProvider;
}
