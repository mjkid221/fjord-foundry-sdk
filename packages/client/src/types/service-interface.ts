import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createPublicClient } from 'viem';

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

export interface ClientService extends PublicClientServiceInterface, SolanaConnectionServiceInterface {}
