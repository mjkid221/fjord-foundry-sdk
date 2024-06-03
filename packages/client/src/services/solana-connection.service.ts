import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey } from '@solana/web3.js';

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
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Creates a new instance of SolanaConnectionService.
   * @param {WalletAdapterNetwork} network - The network to connect to.
   * @returns {Promise<SolanaConnectionService>} - A promise that resolves with a new SolanaConnectionService instance.
   */
  static async create(connection: Connection): Promise<SolanaConnectionService> {
    return new SolanaConnectionService(connection);
  }

  public getConnection(): Connection {
    return this.connection;
  }
}
