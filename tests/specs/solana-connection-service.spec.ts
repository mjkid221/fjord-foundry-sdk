import { SolanaConnectionService } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl } from '@solana/web3.js';

describe('Solana Connection Service', () => {
  const network = WalletAdapterNetwork.Devnet;
  let service: SolanaConnectionService;
  beforeEach(() => {
    service = new SolanaConnectionService(new Connection(clusterApiUrl(network)));
  });

  it('should create an instance of SolanaConnectionService', () => {
    expect(service).toBeInstanceOf(SolanaConnectionService);
  });

  it('should return a connection object', () => {
    expect(service.getConnection()).toBeDefined();
    expect(service.getConnection()).toBeInstanceOf(Connection);
  });
});
