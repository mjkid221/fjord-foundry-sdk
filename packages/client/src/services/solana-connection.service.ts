import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

import { SolanaConnectionServiceInterface } from '../types';

/**
 * Represents a service for managing connections and wallet interactions with Solana blockchain.
 */
export class SolanaConnectionService implements SolanaConnectionServiceInterface {
  private connection: Connection;
  private wallet: PhantomWalletAdapter | null = null; // Store wallet instance
  private publicKey: PublicKey | null = null; // Cache public key
  private network: WalletAdapterNetwork;

  /**
   * Creates an instance of SolanaConnectionService.
   * @param {WalletAdapterNetwork} network - The network to connect to.
   * @param {Connection} [connection] - Optional pre-existing Solana connection object.
   */
  constructor(network: WalletAdapterNetwork, connection?: Connection) {
    this.connection = connection ?? new Connection(clusterApiUrl(network), 'confirmed');
    this.network = network;
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
}
