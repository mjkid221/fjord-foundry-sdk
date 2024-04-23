import { Connection, TransactionInstruction } from '@solana/web3.js';
import { createPublicClient } from 'viem';

import { SwapExactSharesForAssetsOperationParams, SwapSharesWithExactAssetsOperationParams } from './lbp-buy-sell';
import { InitializePoolParams, InitializePoolResponse } from './lbp-initialization';
export interface PublicClientServiceInterface {
  /**
   * This method returns the public client instance. TODO: This will be refactored to use Solana requirements.
   * @returns {ReturnType<typeof createPublicClient>} The public client instance.
   */
  getPublicClient?(): ReturnType<typeof createPublicClient>;
}

export interface SolanaConnectionServiceInterface {
  /**
   * Gets the Solana connection object.
   * @returns {Connection} - The Solana connection object.
   */
  getConnection?(): Connection;
}

export interface ClientServiceInterface extends PublicClientServiceInterface, SolanaConnectionServiceInterface {}

export interface LbpInitializationServiceInterface {
  /**
   * Initializes a liquidity bootstrapping pool (LBP) transaction instruction with the provided parameters.
   * This includes constructing the program instruction, fetching necessary account information, and calculating the pool's PDA.
   *
   * @param {InitializePoolParams} options - The options for initializing the pool (keys and arguments).
   * @returns {Promise<InitializePoolResponse>} - A promise that resolves with the transaction instruction and pool PDA.
   *
   * @example
   * ```typescript
   * const { transactionInstruction, poolPda } = await lbpInitializationService.initializePool({ keys, args });
   * ```
   */
  initializePool({ keys, args }: InitializePoolParams): Promise<InitializePoolResponse>;
}

export interface LbpBuyServiceInterface {
  /**
   * Asynchronously creates a Solana TransactionInstruction for a "swap assets for exact shares"
   * operation within a liquidity pool. This instruction allows users to exchange an input asset
   * for a specified quantity of pool shares.
   *
   * @param {SwapExactSharesForAssetsOperationParams} params - Parameters for the swap operation:
   * @param {Object} params.keys - Solana PublicKeys:
   * @param {PublicKey} params.keys.userPublicKey - Public key of the user.
   * @param {PublicKey} params.keys.creator - Public key of the pool creator.
   * @param {PublicKey} params.keys.referrer - Public key of the referrer (optional).
   * @param {PublicKey} params.keys.shareTokenMint - Mint of the pool's share tokens.
   * @param {PublicKey} params.keys.assetTokenMint - Mint of the asset token accepted by the pool.
   * @param {Object} params.args - Arguments for the swap operation:
   * @param {PublicKey} params.args.poolPda - Program Derived Address (PDA) of the pool.
   * @param {BN} params.args.sharesAmountOut - Desired quantity of shares to receive.
   *
   * @returns {Promise<TransactionInstruction>} - A Promise resolving to the swap TransactionInstruction.
   *
   * @throws {Error} - Throws an error if:
   *   * The provided pool PDA doesn't match the calculated PDA based on mints and creator.
   *   * The previewing of the swap transaction fails.
   *   * The generation of the program instruction fails.
   */
  createSwapAssetsForExactSharesInstruction({
    keys,
    args,
  }: SwapExactSharesForAssetsOperationParams): Promise<TransactionInstruction>;

  /**
   * Asynchronously creates a Solana TransactionInstruction for a "swap exact assets for shares"
   * operation within a liquidity pool. This instruction allows users to exchange a specified
   * quantity of an asset for pool shares.
   *
   * @param {SwapSharesWithExactAssetsOperationParams} params - Parameters for the swap operation:
   * @param {Object} params.keys - Solana PublicKeys:
   * @param {PublicKey} params.keys.userPublicKey - Public key of the user.
   * @param {PublicKey} params.keys.creator - Public key of the pool creator.
   * @param {PublicKey} params.keys.referrer - Public key of the referrer (optional).
   * @param {PublicKey} params.keys.shareTokenMint - Mint of the pool's share tokens.
   * @param {PublicKey} params.keys.assetTokenMint - Mint of the asset token accepted by the pool.
   * @param {Object} params.args - Arguments for the swap operation:
   * @param {PublicKey} params.args.poolPda - Program Derived Address (PDA) of the pool.
   * @param {BigNumber} params.args.assetsAmountIn - Exact quantity of assets to use in the swap.
   *
   * @returns {Promise<TransactionInstruction>} - A Promise resolving to the swap TransactionInstruction.
   *
   * @throws {Error} - Throws an error if:
   *   * The provided pool PDA doesn't match the calculated PDA based on mints and creator.
   *   * The previewing of the swap transaction fails.
   *   * The generation of the program instruction fails.
   */
  createSwapExactAssetsForSharesInstruction({
    keys,
    args,
  }: SwapSharesWithExactAssetsOperationParams): Promise<TransactionInstruction>;
}
