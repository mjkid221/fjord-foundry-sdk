import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';

import { SolanaConnectionServiceInterface } from '../types';

/**
 * Represents a service for managing connections and wallet interactions with Solana blockchain.
 */
export class SolanaConnectionService implements SolanaConnectionServiceInterface {
  private connection: Connection;
  private wallet: PhantomWalletAdapter | null = null; // Store wallet instance
  private publicKey: PublicKey | null = null; // Cache public key

  /**
   * Creates an instance of SolanaConnectionService.
   * @param {WalletAdapterNetwork} network - The network to connect to.
   * @param {Connection} [connection] - Optional pre-existing Solana connection object.
   */
  constructor(network: WalletAdapterNetwork, connection?: Connection) {
    this.connection = connection ?? new Connection(clusterApiUrl(network), 'confirmed');
  }

  /**
   * Creates a new instance of SolanaConnectionService.
   * @param {WalletAdapterNetwork} network - The network to connect to.
   * @returns {Promise<SolanaConnectionService>} - A promise that resolves with a new SolanaConnectionService instance.
   */
  static async create(network: WalletAdapterNetwork): Promise<SolanaConnectionService> {
    const connection = await Promise.resolve(new Connection(clusterApiUrl(network), 'confirmed'));
    return new SolanaConnectionService(network, connection);
  }

  public getConnection(): Connection {
    return this.connection;
  }

  public async connectWallet(network: WalletAdapterNetwork): Promise<PublicKey | null> {
    if (!this.wallet) {
      // Initialize wallet instance if not already initialized
      this.wallet = new PhantomWalletAdapter({ network: network });
    }

    // Attempt wallet connection
    try {
      await this.wallet.connect();
      this.publicKey = this.wallet.publicKey; // Cache public key
      return this.publicKey;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  public async signTransaction(transaction: Transaction): Promise<Transaction | null> {
    // Ensure wallet is connected before signing
    if (!this.wallet?.connected) {
      console.error('Wallet is not connected.');
      return null;
    }

    // Sign the transaction
    try {
      return await this.wallet.signTransaction(transaction);
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }
}
