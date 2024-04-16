import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createPublicClient } from 'viem';

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

  /**
   * Gets the connected wallet.
   * @returns {PhantomWalletAdapter | null} - The connected wallet, or null if no wallet is connected.
   */
  getConnectedWallet?(): Promise<PhantomWalletAdapter | null>;

  /**
   * Connects the wallet to the specified network.
   * @param {WalletAdapterNetwork} network - The network to connect to.
   * @returns {Promise<PublicKey | null>} - A promise that resolves with the public key of the connected wallet, or null if connection fails.
   */
  connectWallet?(network: WalletAdapterNetwork): Promise<PublicKey | null>;

  /**
   * Signs a transaction using the connected wallet.
   * @param {Transaction} transaction - The transaction to be signed.
   * @returns {Promise<Transaction | null>} - A promise that resolves with the signed transaction, or null if signing fails.
   */
  signTransaction?(transaction: Transaction): Promise<Transaction | null>;
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
