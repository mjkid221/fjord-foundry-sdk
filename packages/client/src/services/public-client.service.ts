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
