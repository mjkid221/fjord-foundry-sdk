import { Connection, TransactionInstruction, PublicKey } from '@solana/web3.js';
import { createPublicClient } from 'viem';

import { SwapExactSharesForAssetsOperationParams, SwapSharesForExactAssetsOperationParams } from './lbp-buy-sell';
import { InitializePoolParams, InitializePoolResponse } from './lbp-initialization';
import { NewFeeParams, PausePoolParams } from './lbp-management';
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
  getConnection(): Connection;
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
   * @param {SwapSharesForExactAssetsOperationParams} params - Parameters for the swap operation:
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
  }: SwapSharesForExactAssetsOperationParams): Promise<TransactionInstruction>;
}

export interface LbpSellServiceInterface {
  /**
   * Asynchronously creates a Solana TransactionInstruction for a "swap exact shares for assets"
   * operation within a liquidity pool. This instruction allows users to exchange a precise quantity
   * of pool shares for assets.
   *
   * @param {SwapExactSharesForAssetsOperationParams} params - Parameters for the swap operation:
   * @param {Object} params.keys - Solana PublicKeys:
   * @param {PublicKey} params.keys.userPublicKey - Public key of the user.
   * @param {PublicKey} params.keys.creator - Public key of the pool creator.
   * @param {PublicKey} params.keys.shareTokenMint - Mint of the pool's share tokens.
   * @param {PublicKey} params.keys.assetTokenMint - Mint of the asset token accepted by the pool.
   * @param {Object} params.args - Arguments for the swap operation:
   * @param {PublicKey} params.args.poolPda - Program Derived Address (PDA) of the pool.
   * @param {BN} params.args.sharesAmountOut - Number of pool shares to sell.
   *
   * @returns {Promise<TransactionInstruction>} - A Promise resolving to the swap TransactionInstruction.
   *
   * @throws {Error} - Throws an error if:
   *   * The provided pool PDA doesn't match the calculated PDA based on mints and creator.
   *   * The previewing of the swap transaction fails.
   *   * The generation of the program instruction fails.
   */
  createSwapExactSharesForAssetsInstruction({
    keys,
    args,
  }: SwapExactSharesForAssetsOperationParams): Promise<TransactionInstruction>;

  /**
   * Asynchronously creates a Solana TransactionInstruction for a "swap shares for exact assets"
   * operation within a liquidity pool. This instruction allows users to exchange pool shares for
   * a specified amount of assets.
   *
   * @param {SwapSharesForExactAssetsOperationParams} params - Parameters for the swap operation:
   * @param {Object} params.keys - Solana PublicKeys:
   * @param {PublicKey} params.keys.userPublicKey - Public key of the user.
   * @param {PublicKey} params.keys.creator - Public key of the pool creator.
   * @param {PublicKey} params.keys.shareTokenMint - Mint of the pool's share tokens.
   * @param {PublicKey} params.keys.assetTokenMint - Mint of the asset token accepted by the pool.
   * @param {Object} params.args - Arguments for the swap operation:
   * @param {PublicKey} params.args.poolPda - Program Derived Address (PDA) of the pool.
   * @param {BigNumber} params.args.assetsAmountIn - Exact quantity of assets to spend.
   *
   * @returns {Promise<TransactionInstruction>} - A Promise resolving to the swap TransactionInstruction.
   *
   * @throws {Error} - Throws an error if:
   *   * The provided pool PDA doesn't match the calculated PDA based on mints and creator.
   *   * The previewing of the swap transaction fails.
   *   * The generation of the program instruction fails.
   */
  createSwapSharesForExactAssetsInstruction({
    keys,
    args,
  }: SwapSharesForExactAssetsOperationParams): Promise<TransactionInstruction>;
}

export interface LbpManagementServiceInterface {
  /**
   * Pauses the liquidity bootstrapping pool (LBP) by disabling the ability to buy or sell pool shares.
   * This method generates a Solana transaction instruction that calls the `togglePause` method
   * of the LBP smart contract.
   *
   * **Important:**
   * * This method performs pre-transaction validation to ensure data consistency:
   *    - Verifies that the provided `poolPda` matches the calculated PDA based on token mints and creator.
   *    - Checks if the pool is already paused.
   *    - Confirms that the provided creator and token mints match the pool's state on the blockchain.
   * * Before using this method, ensure the connected wallet has the authority to pause the pool
   *   (usually this requires the connected wallet to be the pool's creator).
   *
   * @param {PausePoolParams} params - Parameters for pausing the pool.
   * @param {PublicKey} params.poolPda - The Program Derived Address (PDA) of the LBP pool.
   * @param {PublicKey} params.creator - The public key of the wallet that created the pool.
   * @param {PublicKey} params.shareTokenMint - The public key of the mint for the pool's share tokens.
   * @param {PublicKey} params.assetTokenMint - The public key of the mint for the pool's underlying asset.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the Solana transaction
   *                                           instruction for pausing the pool. After calling this method,
   *                                           you will need to sign and submit the transaction to the Solana network.
   *
   */
  pauseLbp({ poolPda, creator, shareTokenMint, assetTokenMint }: PausePoolParams): Promise<TransactionInstruction>;

  /**
   * Unpauses a liquidity bootstrapping pool (LBP), re-enabling the ability to buy or sell pool shares.
   * This method generates a Solana transaction instruction that calls the `togglePause` method (likely
   * the same method used for pausing) of the LBP smart contract.
   *
   * **Important:**
   * * This method performs pre-transaction validation to ensure data consistency:
   *    - Verifies that the provided `poolPda` matches the calculated PDA based on token mints and creator.
   *    - Checks if the pool is already unpaused.
   *    - Confirms that the provided creator and token mints match the pool's state on the blockchain.
   * * Before using this method, ensure the connected wallet has the authority to unpause the pool
   *   (usually this requires the connected wallet to be the pool's creator).
   *
   * @param {PausePoolParams} params - Parameters for unpausing the pool.
   * @param {PublicKey} params.poolPda - The Program Derived Address (PDA) of the LBP pool.
   * @param {PublicKey} params.creator - The public key of the wallet that created the pool.
   * @param {PublicKey} params.shareTokenMint - The public key of the mint for the pool's share tokens.
   * @param {PublicKey} params.assetTokenMint - The public key of the mint for the pool's underlying asset.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the Solana transaction
   *                                           instruction for unpausing the pool. After calling this method,
   *                                           you will need to sign and submit the transaction to the Solana network.
   *
   */
  unPauseLbp({ poolPda, creator, shareTokenMint, assetTokenMint }: PausePoolParams): Promise<TransactionInstruction>;

  /**
   * Initiates the process of transferring ownership of the LBP smart contract to a new wallet. This method
   * generates a Solana transaction instruction that likely calls a `nominateNewOwner` method within your smart contract.
   *
   * **Important:**
   *  * This method only begins the ownership transfer process.
   *  * The nominated will need to accept the ownership transfer.
   *  * Before using this method, ensure the connected wallet has the authority to nominate a new owner for the pool.
   *
   * @param {PublicKey} newOwnerPublicKey - The public key of the wallet that will become the nominated new owner of the LBP.
   * @returns {Promise<TransactionInstruction>} A promise that resolves with the Solana transaction instruction for
   *                                          nominating a new owner. After calling this method, you will need to
   *                                          sign and submit the transaction to the Solana network.
   *
   */
  createNewOwnerNomination({ newOwnerPublicKey }: { newOwnerPublicKey: PublicKey }): Promise<TransactionInstruction>;

  /**
   * Allows the nominated new owner of a liquidity bootstrapping pool (LBP) to accept ownership.
   * This method generates a Solana transaction instruction, likely calling an `acceptNewOwner` method within your smart contract.
   *
   * **Important:**
   * * This method assumes a previous nomination of a new owner was made (e.g., using the `createNewOwnerNomination`  function).
   * * Before using this method, ensure the connected wallet corresponds to the nominated owner's public key (`newOwnerPublicKey`).
   *
   * @param {Object} params - Parameters for accepting the new owner nomination.
   * @param {PublicKey} params.newOwnerPublicKey - The public key of the nominated owner (this wallet should be the connected wallet).
   * @returns {Promise<TransactionInstruction>} A promise that resolves with the Solana transaction instruction
   *                                          for accepting the new owner nomination. After calling this method,
   *                                          you will need to sign and submit the transaction to the Solana network.
   *
   */
  acceptOwnerNomination({ newOwnerPublicKey }: { newOwnerPublicKey: PublicKey }): Promise<TransactionInstruction>;

  /**
   * Updates the fees associated with a liquidity bootstrapping pool (LBP). This method generates a Solana transaction
   * instruction that likely calls a `setFees` method in your smart contract. Fees can be updated individually or all at once.
   *
   * **Important:**
   * * Ensure the connected wallet has the authority to modify fees for the pool (usually this requires the
   *      connected wallet to be the pool's owner).
   *
   * @param {NewFeeParams} params - Parameters for updating the pool's fees.
   * @param {number} [params.platformFee] - The new platform fee (optional).
   * @param {number} [params.referralFee] - The new referral fee (optional).
   * @param {number} [params.swapFee] - The new swap fee (optional).
   * @param {PublicKey} params.ownerPublicKey - The public key of the wallet authorized to modify fees (likely the pool owner).
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the Solana transaction instruction
   *                                            for updating the pool's fees. After calling this method, you will
   *                                            need to sign and submit the transaction to the Solana network.
   */
  setPoolFees({ platformFee, referralFee, swapFee, ownerPublicKey }: NewFeeParams): Promise<TransactionInstruction>;
}
