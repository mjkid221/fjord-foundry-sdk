import { PublicKey, TransactionInstruction } from '@solana/web3.js';

import {
  GetContractArgsResponse,
  GetContractManagerAddressResponse,
  GetReservesAndWeightsResponse,
  GetVestingStateResponse,
  ReadContractRequest,
  RetrievePoolDataParams,
  RetrieveSinglePoolDataValueParams,
} from './client';
import {
  SwapExactSharesForAssetsInstructionClientParams,
  SwapSharesForExactAssetsInstructionClientParams,
} from './lbp-buy-sell';
import { CreatePoolClientParams, GetPoolDataResponse, InitializePoolResponse } from './lbp-initialization';

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
   * @param options.programId - The public key of the program governing the LBP.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<InitializePoolResponse>} - A promise that resolves with the LBP initialization transaction.
   *
   * @example
   * ```typescript
   * const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);
   * const programAddressPublicKey = new PublicKey('... your program address ...');
   *
   * // ... (keys and args defined)
   * const response = await sdkClient.createPool({ programId: programAddressPublicKey, keys, args, provider });
   * ```
   */
  createPoolTransaction({ keys, args, programId, provider }: CreatePoolClientParams): Promise<InitializePoolResponse>;

  /**
   * Creates a transaction for swapping assets for an exact amount of LBP shares on the Solana blockchain.
   *
   * @param {SwapExactSharesForAssetsInstructionClientParams} options - The options for creating the swap transaction.
   * @param options.keys - The public keys required for the swap.
   * @param options.args - The arguments for the swap.
   * @param options.programId - The public key of the program governing the LBP.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated swap transaction instruction.
   */
  createSwapAssetsForExactSharesTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapExactSharesForAssetsInstructionClientParams): Promise<TransactionInstruction>;

  /**
   * Creates a transaction for swapping an exact amount of assets for LBP shares on the Solana blockchain.
   *
   * @param {SwapSharesForExactAssetsInstructionClientParams} options - The options for creating the swap transaction.
   * @param options.keys - The public keys required for the swap.
   * @param options.args - The arguments for the swap.
   * @param options.programId - The public key of the program governing the LBP.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated swap transaction instruction.
   */
  createSwapExactAssetsForSharesTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams): Promise<TransactionInstruction>;

  /**
   * Creates a transaction for swapping an exact amount of assets for LBP shares on the Solana blockchain. This function
   * acts as a wrapper, delegating the actual creation process to the `LbpSellService`.
   *
   * @param {SwapSharesForExactAssetsInstructionClientParams} options - The options for creating the swap transaction.
   * @param options.keys - The public keys required for the swap.
   * @param options.args - The arguments for the swap.
   * @param options.programId - The public key of the program governing the LBP.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated swap transaction instruction.
   * @throws {Error} - Throws an error if this client is not configured for Solana interactions.
   */
  createSwapSharesForExactAssetsTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams): Promise<TransactionInstruction>;

  /**
   * Creates a transaction for swapping an exact amount of LBP shares for assets on the Solana blockchain. This function
   * acts as a wrapper, delegating the actual creation process to the `LbpSellService`.
   *
   * @param {SwapExactSharesForAssetsInstructionClientParams} options - The options for creating the swap transaction.
   * @param options.keys - The public keys required for the swap.
   * @param options.args - The arguments for the swap.
   * @param options.programId - The public key of the program governing the LBP.
   * @param options.provider - The Anchor provider for the transaction.
   * @returns {Promise<TransactionInstruction>} - A promise that resolves with the generated swap transaction instruction.
   * @throws {Error} - Throws an error if this client is not configured for Solana interactions.
   */
  createSwapExactSharesForAssetsTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapExactSharesForAssetsInstructionClientParams): Promise<TransactionInstruction>;

  /**
   * Retrieves and formats data associated with a liquidity bootstrapping pool.
   *
   * @param {RetrievePoolDataParams} params
   *  * **poolPda:** The public key of the pool's Program Derived Address (PDA).
   *  * **programId:** The program ID associated with the pool.
   *
   * @returns {Promise<GetPoolDataResponse>} A promise resolving to an object containing:
   *  * Formatted pool data, with some values converted for front-end readability.
   *  * Additional calculated values like token divisors.
   *
   * @throws {Error} If:
   *  * This method is called on a client that doesn't support Solana.
   *  * No `lbpInitializationService` instance exists (handles internal initialization if needed).
   */
  retrievePoolData({ poolPda, programId }: RetrievePoolDataParams): Promise<GetPoolDataResponse>;

  /**
   * Retrieves a specific data value from a liquidity bootstrapping pool.
   *
   * @param {RetrieveSinglePoolDataValueParams} params
   *   * **poolPda:** The public key of the pool's Program Derived Address (PDA).
   *   * **programId:** The program ID associated with the pool.
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
    programId,
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
}

export interface ClientSdkInterfaceEvm {
  /**
   * Retrieves arguments for a specified LBP contract on the blockchain.
   *
   * This method is designed to query the blockchain for specific contract arguments,
   * utilizing the provided contract address and ABI to make the request. It is primarily
   * used for fetching contract details that are essential for interacting with the contract,
   * such as asset information, shares, and other financial or ownership details.
   *
   * @param {ReadContractRequest} request An object containing the contract address and ABI needed for the query.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which defines how to interact with it.
   *
   * @returns {Promise<GetContractArgsResponse>} A promise that resolves to an object containing details about the
   * contract's arguments, such as asset, share, assets, shares, virtual assets, and others.
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';
   * const abi = [...]; // ABI for the contract
   * sdk.getContractArgs({ contractAddress, abi })
   *    .then(response => console.log(response))
   *    .catch(error => console.error(error));
   */
  getContractArgs(request: ReadContractRequest): Promise<GetContractArgsResponse>;

  /**
   * Retrieves the manager address for a specified contract.
   *
   * This method queries the blockchain for the manager address of a specific contract,
   * using the contract's address and ABI to make the request. The manager address is
   * typically the account that deployed or manages the contract, holding permissions
   * for administrative actions on the contract.
   *
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   *
   * @returns {Promise<GetContractManagerAddressResponse>} A promise that resolves to the blockchain address of the
   * contract's manager. The address is a string that starts with '0x'.
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';
   * const abi = [...]; // ABI for the contract
   *
   * sdk.getContractManagerAddress({ contractAddress, abi })
   *    .then(managerAddress => console.log(managerAddress))
   *    .catch(error => console.error(error));
   */
  getContractManagerAddress({ contractAddress, abi }: ReadContractRequest): Promise<GetContractManagerAddressResponse>;

  /**
   * Checks if an LBP is closed.
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the pool is closed.
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';
   * const abi = [...]; // ABI for the contract
   *
   * sdk.isPoolClosed({ contractAddress, abi })
   *   .then(isClosed => console.log(isClosed))
   *   .catch(error => console.error(error));
   *
   */
  isPoolClosed({ contractAddress, abi }: ReadContractRequest): Promise<boolean>;

  /**
   * Checks if selling is allowed for a given LBP.
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether selling is allowed.
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';
   * const abi = [...]; // ABI for the contract
   *
   * sdk.isSellingAllowed({ contractAddress, abi })
   *  .then(isAllowed => console.log(isAllowed))
   *  .catch(error => console.error(error));
   */
  isSellingAllowed({ contractAddress, abi }: ReadContractRequest): Promise<boolean>;

  /**
   * Retrieves the maximum total assets in for a given LBP.
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   * @returns {Promise<bigint>} A promise that resolves to the maximum total assets for the LBP.
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923'
   * const abi = [...]; // ABI for the contract
   *
   * sdk.maxTotalAssetsIn({ contractAddress, abi })
   *  .then(maxTotalAssets => console.log(maxTotalAssets))
   *  .catch(error => console.error(error));
   *
   */
  getMaxTotalAssetsIn({ contractAddress, abi }: ReadContractRequest): Promise<bigint>;

  /**
   * Retrieves the maximum total shares out for a given LBP.
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   *
   * @returns {Promise<bigint>} A promise that resolves to the maximum total shares for the LBP.
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923'
   * const abi = [...]; // ABI for the contract
   *
   * sdk.maxTotalSharesOut({ contractAddress, abi })
   *  .then(maxTotalShares => console.log(maxTotalShares))
   *  .catch(error => console.error(error));
   *
   */
  getMaxTotalSharesOut({ contractAddress, abi }: ReadContractRequest): Promise<bigint>;

  /**
   * Retrieves the vesting state for a given LBP.
   *
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   *
   * @returns {Promise<GetVestingStateResponse>} A promise that resolves to an object containing the vesting state.
   * The object contains a boolean value indicating whether vesting shares are enabled, the vesting cliff timestamp,
   * and the vesting end timestamp.
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923'
   * const abi = [...]; // ABI for the contract
   *
   * sdk.getVestingState({ contractAddress, abi })
   * .then(vestingState => console.log(vestingState))
   * .catch(error => console.error(error));
   *
   */
  getVestingState({ contractAddress, abi }: ReadContractRequest): Promise<GetVestingStateResponse>;

  /**
   * Retrieves the total number of shares purchased for a given LBP.
   *
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   *
   * @returns {Promise<bigint>} A promise that resolves to the total shares purchased for the LBP.
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923'
   *
   * sdk.getTotalSharesPurchased({ contractAddress, abi })
   * .then(totalShares => console.log(totalShares))
   * .catch(error => console.error(error));
   *
   */
  getTotalSharesPurchased({ contractAddress, abi }: ReadContractRequest): Promise<bigint>;

  /**
   * Retrieves the reserves and weights for a given LBP.
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   *
   * @returns {Promise<GetReservesAndWeightsResponse>} A promise that resolves to an object containing the reserves and weights
   *
   * @example
   * const publicClient = new PublicClientService();
   * const sdk = new FjordClientSdk(publicClient);
   * const contractAddress = '0xa2d8f923'
   * const abi = [...]; // ABI for the contract
   *
   * sdk.getReservesAndWeights({ contractAddress, abi })
   * .then(reservesAndWeights => console.log(reservesAndWeights))
   * .catch(error => console.error(error));
   */
  getReservesAndWeights({ contractAddress, abi }: ReadContractRequest): Promise<GetReservesAndWeightsResponse>;
}

export interface ClientSdkInterface extends ClientSdkInterfaceSolana, ClientSdkInterfaceEvm {}
