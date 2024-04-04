import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

/**
 * TODO: This will be refactored to use Solana requirements.
 */
export class PublicClientService {
  private client: ReturnType<typeof createPublicClient>;

  constructor() {
    this.client = createPublicClient({
      chain: mainnet,
      transport: http(),
    });
  }

  getPublicClient() {
    return this.client;
  }
}
