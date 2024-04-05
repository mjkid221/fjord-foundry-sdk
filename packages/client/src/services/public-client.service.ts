import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

import { PublicClientServiceInterface } from '../types';

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
 * **This is a scaffold for the Solana implementation.**
 */
// private connection: Connection;
// constructor() {
//   // Choose the cluster you want to connect to
//   this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
// }
// public getConnection(): Connection {
//   return this.connection;
// }
