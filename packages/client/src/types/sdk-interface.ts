import { PublicKey, TransactionInstruction } from '@solana/web3.js';

import { RetrievePoolDataParams, RetrieveSinglePoolDataValueParams } from './client';
import {
  SwapExactSharesForAssetsInstructionClientParams,
  SwapSharesForExactAssetsInstructionClientParams,
} from './lbp-buy-sell';
import { CreatePoolClientParams, GetPoolDataResponse, InitializePoolResponse } from './lbp-initialization';
import {
  CreateNewOwnerNominationClientParams,
  PausePoolClientParams,
  SetNewPoolFeesClientParams,
  SetTreasuryFeeRecipientsClientParams,
} from './lbp-management';
import {
  CreatorTokenBalances,
  GetFeeRecipientsResponse,
  GetPoolFeesResponse,
  GetUserTokenBalanceParams,
  PoolTokenAccounts,
  PoolTokenBalances,
  UserPoolStateBalances,
} from './lbp-read';

export interface ClientSdkInterfaceSolana {
  /**
   * Creates a transaction to initialize a new liquidity bootstrapping pool (LBP) on the Solana blockchain.
   *
   * 1. **Checks Client Compatibility:** Verifies if the connected client supports the necessary methods.
   * 2. **Creates LBP Service:** Instantiates an `LbpInitializationService` object for handling pool setup.
   * 3. **Calls Initialization:** Calls the `initializePool` method of the `LbpInitializationService` to construct the transaction.
   * 4. **Returns Transaction:** Returns the generated transaction, ready for submission to the Solana network.
   *
   * @param {CreatePoolClientParams} options - The options for creating the pool transaction.
   * @param options.keys - The public keys required for initializing the pool.
   * @param options.args - The arguments for initializing the pool.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<InitializePoolResponse>} - A promise that resolves with the LBP initialization transaction.
   *
   * @example
   * ```typescript
   * const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);
   * const programAddressPublicKey = new PublicKey('... your program address ...');
   *
   * // ... (keys and args defined)
   * const response = await sdkClient.createPool({ keys, args, provider });
   * ```
   */
  createPoolTransaction({ keys, args, provider }: CreatePoolClientParams): Promise<InitializePoolResponse>;

  /**
   * Creates a transaction for swapping assets for an exact amount of LBP shares on the Solana blockchain.
   *
   * @param {SwapExactSharesForAssetsInstructionClientParams} options - The options for creating the swap transaction.
   * @param options.keys - The public keys required for the swap.
   * @param options.args - The arguments for the swap.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated swap transaction instruction.
   */
  createSwapAssetsForExactSharesTransaction({
    keys,
    args,
    provider,
  }: SwapExactSharesForAssetsInstructionClientParams): Promise<TransactionInstruction>;

  /**
   * Creates a transaction for swapping an exact amount of assets for LBP shares on the Solana blockchain.
   *
   * @param {SwapSharesForExactAssetsInstructionClientParams} options - The options for creating the swap transaction.
   * @param options.keys - The public keys required for the swap.
   * @param options.args - The arguments for the swap.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated swap transaction instruction.
   */
  createSwapExactAssetsForSharesTransaction({
    keys,
    args,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams): Promise<TransactionInstruction>;

  /**
   * Creates a transaction for swapping an exact amount of assets for LBP shares on the Solana blockchain. This function
   * acts as a wrapper, delegating the actual creation process to the `LbpSellService`.
   *
   * @param {SwapSharesForExactAssetsInstructionClientParams} options - The options for creating the swap transaction.
   * @param options.keys - The public keys required for the swap.
   * @param options.args - The arguments for the swap.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated swap transaction instruction.
   * @throws {Error} - Throws an error if this client is not configured for Solana interactions.
   */
  createSwapSharesForExactAssetsTransaction({
    keys,
    args,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams): Promise<TransactionInstruction>;

  /**
   * Creates a transaction for swapping an exact amount of LBP shares for assets on the Solana blockchain. This function
   * acts as a wrapper, delegating the actual creation process to the `LbpSellService`.
   *
   * @param {SwapExactSharesForAssetsInstructionClientParams} options - The options for creating the swap transaction.
   * @param options.keys - The public keys required for the swap.
   * @param options.args - The arguments for the swap.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated swap transaction instruction.
   * @throws {Error} - Throws an error if this client is not configured for Solana interactions.
   */
  createSwapExactSharesForAssetsTransaction({
    keys,
    args,
    provider,
  }: SwapExactSharesForAssetsInstructionClientParams): Promise<TransactionInstruction>;

  /**
   * Pauses a liquidity bootstrapping pool (LBP) on the Solana blockchain.
   *
   * @param {PausePoolClientParams} options - The options for pausing the pool.
   * @param options.args - The arguments for pausing the pool.
   * @param options.args.poolPda - The public key of the pool's Program Derived Address (PDA).
   * @param options.args.creator - The public key of the pool's creator.
   * @param options.args.shareTokenMint - The public key of the pool's share token mint.
   * @param options.args.assetTokenMint - The public key of the pool's asset token mint.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated pause transaction instruction.
   */
  pausePool({ args, provider }: PausePoolClientParams): Promise<TransactionInstruction>;

  /**
   * Unpauses a liquidity bootstrapping pool (LBP) on the Solana blockchain.
   *
   * @param {PausePoolClientParams} options - The options for unpausing the pool.
   * @param options.args - The arguments for unpausing the pool.
   * @param options.args.poolPda - The public key of the pool's Program Derived Address (PDA).
   * @param options.args.creator - The public key of the pool's creator.
   * @param options.args.shareTokenMint - The public key of the pool's share token mint.
   * @param options.args.assetTokenMint - The public key of the pool's asset token mint.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated unpause transaction instruction.
   */
  unPausePool({ args, provider }: PausePoolClientParams): Promise<TransactionInstruction>;

  /**
   * Facilitates the nomination of a new owner for a liquidity bootstrapping pool (LBP). This function
   * leverages the `LbpManagementService` to generate the necessary Solana transaction instruction.
   *
   * **Important:**
   * * Ensure the connected wallet has the authority to nominate a new owner for the pool.
   *
   * @param {CreateNewOwnerNominationClientParams} params - Parameters for the owner nomination process.
   * @param {AnchorProvider} params.provider - An Anchor Provider for interacting with Solana.
   * @param {PublicKey} params.newOwnerPublicKey - The public key of the wallet to be nominated as the new owner.
   * @param {PublicKey} params.creator - The public key of the wallet nominating the new owner. If not provided,
   * @returns {Promise<TransactionInstruction>} A promise that resolves with the Solana transaction instruction
   *                                          for nominating a new owner. After calling this method, you will
   *                                          need to sign and submit the transaction to the Solana network.
   */
  nominateNewOwner({
    provider,
    newOwnerPublicKey,
    creator,
  }: CreateNewOwnerNominationClientParams): Promise<TransactionInstruction>;

  /**
   * Facilitates the acceptance of a new owner nomination for a liquidity bootstrapping pool (LBP). This function
   * leverages the `LbpManagementService` to generate the necessary Solana transaction instruction.
   *
   * **Important:**
   * * Ensure the connected wallet has the authority to accept a new owner nomination for the pool.
   *
   * @param {CreateNewOwnerNominationClientParams} params - Parameters for the owner nomination acceptance process.
   * @param {AnchorProvider} params.provider - An Anchor Provider for interacting with Solana.
   * @param {PublicKey} params.newOwnerPublicKey - The public key of the wallet nominated as the new owner.
   * @returns {Promise<TransactionInstruction>} A promise that resolves with the Solana transaction instruction
   *                                          for accepting a new owner nomination. After calling this method, you will
   *                                          need to sign and submit the transaction to the Solana network.
   */
  acceptNewOwnerNomination({
    provider,
    newOwnerPublicKey,
  }: CreateNewOwnerNominationClientParams): Promise<TransactionInstruction>;

  /**
   * Facilitates updating the fees of a liquidity bootstrapping pool (LBP). This function leverages the 
   * `LbpManagementService` to generate the necessary Solana transaction instruction and provides a higher-level
   * interface for interacting with fee management.

   * **Important:**
   * * Ensure the connected wallet has the authority to modify fees for the pool.

   * @param {SetNewPoolFeesClientParams} params - Parameters for updating pool fees.
   * @param {AnchorProvider} params.provider - An Anchor Provider for interacting with Solana.
   * @param {NewFeeParams} params.feeParams - An object containing the new fee values:
   *    * params.feeParams.platformFee (optional): The new platform fee.
   *    * params.feeParams.referralFee (optional): The new referral fee.
   *    * params.feeParams.swapFee (optional): The new swap fee. 
   *    * params.feeParams.ownerPublicKey: The public key of the wallet authorized to modify fees. 
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the Solana transaction instruction 
   *                                          for updating the pool's fees. After calling this method, you will 
   *                                          need to sign and submit the transaction to the Solana network.
   */
  setNewPoolFees({ feeParams, provider }: SetNewPoolFeesClientParams): Promise<TransactionInstruction>;

  /**
   * Facilitates updating the treasury fee recipients and distribution for a liquidity bootstrapping pool (LBP). 
   * This function leverages the `LbpManagementService` to generate the necessary Solana transaction instruction and 
   * provides a higher-level interface for interacting with fee recipient management.

   * **Important:**
   * * Ensure the connected wallet has the authority to modify fee distribution for the pool.
   * * The total percentage allocated across all `feeRecipients` cannot exceed `MAX_FEE_BASIS_POINTS`.

   * @param {SetTreasuryFeeRecipientsClientParams} params - Parameters for updating treasury fee recipients.
   * @param {PublicKey} params.programId - The PublicKey of the Solana program governing the LBP.
   * @param {AnchorProvider} params.provider - An Anchor Provider for interacting with Solana.
   * @param {SetTreasuryFeeRecipientsParams} params.feeParams - Fee recipient details:
   *    * params.feeParams.swapFeeRecipient - Public key of the wallet designated to receive swap fees.
   *    * params.feeParams.feeRecipients - An array of fee recipient details:
   *       * params.feeParams.feeRecipients[].feeRecipient: The public key of the wallet receiving a portion of fees.
   *       * params.feeParams.feeRecipients[].feePercentage: The percentage of fees (0-100) allocated to this recipient.
   *    * params.feeParams.creator - Public key of the wallet authorized to modify fee distribution.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the Solana transaction instruction for 
   *                                          updating treasury fee recipients. After calling this method, you will 
   *                                          need to sign and submit the transaction to the Solana network.
   *
   */
  setTreasuryFeeRecipients({
    provider,
    feeParams,
  }: SetTreasuryFeeRecipientsClientParams): Promise<TransactionInstruction>;

  /**
   * Retrieves and formats data associated with a liquidity bootstrapping pool.
   *
   * @param {RetrievePoolDataParams} params
   *  * **poolPda:** The public key of the pool's Program Derived Address (PDA).
   *
   * @returns {Promise<GetPoolDataResponse>} A promise resolving to an object containing:
   *  * Formatted pool data, with some values converted for front-end readability.
   *  * Additional calculated values like token divisors.
   *
   * @throws {Error} If:
   *  * This method is called on a client that doesn't support Solana.
   *  * No `lbpInitializationService` instance exists (handles internal initialization if needed).
   */
  retrievePoolData({ poolPda }: RetrievePoolDataParams): Promise<GetPoolDataResponse>;

  /**
   * Retrieves a specific data value from a liquidity bootstrapping pool.
   *
   * @param {RetrieveSinglePoolDataValueParams} params
   *   * **poolPda:** The public key of the pool's Program Derived Address (PDA).
   *   * **valueKey:** A `PoolDataValueKey` enum member specifying the data value to retrieve.
   *
   * @returns {string | number | number[] | boolean} The requested pool data value, formatted if necessary.
   *
   * @throws {Error} If:
   *   * This method is called on a client that doesn't support Solana.
   *   * No `lbpInitializationService` instance exists (handles internal initialization if needed).
   *   * An invalid `valueKey` is provided.
   */
  retrieveSinglePoolDataValue({
    poolPda,
    valueKey,
  }: RetrieveSinglePoolDataValueParams): Promise<string | number | number[] | boolean>;

  /**
   * Reads information about an account on the blockchain.
   * @param {PublicKey} address - The public key of the account to read.
   * @returns {Promise<any>} - A promise that resolves with the account information and context, or null if the account does not exist.
   * @throws {Error} If reading the account information fails.
   * @example
   * const address = new PublicKey('...');
   * sdk.readAddress(address)
   *    .then(accountInfo => console.log(accountInfo))
   *    .catch(error => console.error(error));
   */
  readAddress(address: PublicKey): Promise<any>;

  /**
   * Reads the owner of the pool on the blockchain.
   *
   * @returns {Promise<PublicKey>} - A promise that resolves with the public key of the pool owner.
   */
  readPoolOwner(): Promise<PublicKey>;

  /**
   * Reads the fees of the pool on the blockchain.
   *
   * @returns {Promise<GetPoolFeesResponse>} - A promise that resolves with the platform fee, referral fee and swap fee.
   */
  readPoolFees(): Promise<GetPoolFeesResponse>;

  /**
   * Reads the treasury fee recipients of the pool on the blockchain.
   *
   * @returns {Promise<GetFeeRecipientsResponse[]>} - A promise that resolves with the treasury fee recipients and their percentage value.
   */
  readFeeRecipients(): Promise<GetFeeRecipientsResponse[]>;

  /**
   * Reads the swap fee recipient of the pool on the blockchain.
   *
   * @returns {Promise<PublicKey>} - A promise that resolves with the public key of the swap fee recipient.
   */
  readSwapFeeRecipient(): Promise<PublicKey>;

  /**
   * Reads the associated token accounts of the pool on the blockchain.
   * @param {PublicKey} poolPda - The public key of the pool's Program Derived Address (PDA).
   *
   * @returns {Promise<PoolTokenAccounts>} - A promise that resolves with the public keys of the pool's share token account and asset token account.
   */
  readPoolTokenAccounts({ poolPda }: { poolPda: PublicKey }): Promise<PoolTokenAccounts>;

  /**
   * Reads the token balances of the pool on the blockchain.
   * @param {PublicKey} poolPda - The public key of the pool's Program Derived Address (PDA).
   *
   * @returns {Promise<PoolTokenBalances>} - A promise that resolves with the pool's share token balance and asset token balance.
   */
  readPoolTokenBalances({ poolPda }: { poolPda: PublicKey }): Promise<PoolTokenBalances>;

  /**
   * Reads the creator token balances of the pool on the blockchain.
   *
   * @param {PublicKey} poolPda - The public key of the pool's Program Derived Address (PDA).
   *
   * @returns {Promise<CreatorTokenBalances>} - A promise that resolves with the creator's share token balance and asset token balance.
   */
  readCreatorTokenBalances({ poolPda }: { poolPda: PublicKey }): Promise<CreatorTokenBalances>;

  /**
   * Reads the user token balances of the pool on the blockchain.
   *
   * @param {GetUserTokenBalanceParams} params - The parameters for reading the user token balances.
   * @param {PublicKey} params.poolPda - The public key of the pool's Program Derived Address (PDA).
   * @param {PublicKey} params.userPublicKey - The public key of the user.
   *
   * @returns {Promise<UserPoolStateBalances>} - A promise that resolves with the user's purchased shares, redeemed shares and referred assets.
   */
  readUserTokenBalances({ poolPda, userPublicKey }: GetUserTokenBalanceParams): Promise<UserPoolStateBalances>;
}

export interface ClientSdkInterface extends ClientSdkInterfaceSolana {}
