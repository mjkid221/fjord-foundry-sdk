import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

import { PublicClientServiceInterface, SolanaConnectionServiceInterface } from '../types';

/**
 * TODO: This will be refactored to use Solana requirements.
 */
export class PublicClientService implements PublicClientServiceInterface {
  // This is the EVM implementation of the public client. It exists for testing purposes until the Solana implementation is complete.
  private client: ReturnType<typeof createPublicClient>;

  constructor(client?: ReturnType<typeof createPublicClient>) {
    this.client =
      client ??
      createPublicClient({
        chain: mainnet,
        transport: http(),
      });
  }

  /**
   * Asynchronously creates an instance of `PublicClientService`.
   * This method abstracts the instantiation process, allowing for asynchronous operations,
   * such as fetching configuration or initializing network connections, to be completed
   * before the service is fully instantiated.
   *
   * The method currently initializes a public client with predefined configurations for
   * the mainnet chain using the HTTP transport layer. This setup is intended for the EVM
   * (Ethereum Virtual Machine) implementation and will be adjusted to accommodate Solana
   * requirements in the future.
   *
   * @returns {Promise<PublicClientService>} A promise that resolves to an instance of `PublicClientService`
   *         with a pre-configured client ready for interaction with the blockchain.
   * @example
   * // Example usage:
   * let publicClientService: PublicClientService;
   *
   * async function initService() {
   *   publicClientService = await PublicClientService.create();
   *   // Now publicClientService is ready to use.
   * }
   */
  static async create(): Promise<PublicClientService> {
    // This has been implemented as an synchronous function to prepare for the pending Solana implementation.
    const client = await Promise.resolve(
      createPublicClient({
        chain: mainnet,
        transport: http(),
      }),
    );
    return new PublicClientService(client);
  }

  getPublicClient() {
    return this.client;
  }
}

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
