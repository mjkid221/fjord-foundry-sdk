import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

import {
  GetContractArgsResponse,
  GetContractManagerAddressResponse,
  GetReservesAndWeightsResponse,
  GetVestingStateResponse,
  ReadContractRequest,
} from './client';

export interface ClientSdkInterfaceBeta {
  /**
   * Connects the wallet to the specified network.
   * @param {WalletAdapterNetwork} network - The network to connect to.
   * @returns {Promise<PublicKey | null>} - A promise that resolves with the public key of the connected wallet, or null if connection fails.
   * @throws {Error} If the connection to the wallet fails.
   * @example
   * const publicClient = new SolanaConnectionService();
   * const sdk = new FjordClientSdk(publicClient);
   * const network = WalletAdapterNetwork.Mainnet;
   * sdk.connectWallet(network)
   *    .then(publicKey => console.log(publicKey))
   *    .catch(error => console.error(error));
   */
  connectWallet(network: WalletAdapterNetwork): Promise<PublicKey | null>;

  /**
   * Signs a transaction using the connected wallet.
   * @param {Transaction} transaction - The transaction to be signed.
   * @returns {Promise<Transaction | null>} - A promise that resolves with the signed transaction, or null if signing fails.
   * @throws {Error} If signing the transaction fails.
   * @example
   * const transaction = new Transaction(...);
   * sdk.signTransaction(transaction)
   *    .then(signedTransaction => console.log(signedTransaction))
   *    .catch(error => console.error(error));
   */
  signTransaction(transaction: Transaction): Promise<Transaction | null>;

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

export interface ClientSdkInterface {
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
