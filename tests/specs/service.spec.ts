import { SolanaConnectionService } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

// Mocking the external modules
jest.mock('@solana/wallet-adapter-phantom', () => ({
  PhantomWalletAdapter: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    signTransaction: jest.fn(),
    publicKey: new PublicKey(Keypair.generate().publicKey),
    connected: true,
  })),
}));
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({})),
  PublicKey: jest.fn().mockImplementation((string) => ({ value: string })),
  Transaction: jest.fn(),
  clusterApiUrl: jest.fn().mockReturnValue('mainnet-beta'),
}));

describe('SolanaConnectionService', () => {
  let service: SolanaConnectionService;
  const network = WalletAdapterNetwork.Mainnet;

  beforeEach(async () => {
    service = await SolanaConnectionService.create(network);
  });
  it('should sign a transaction when the wallet is connected', async () => {
    const mockTransaction = new Transaction();
    const signedTransaction = new Transaction();
    service.signTransaction = jest.fn().mockResolvedValue(signedTransaction);

    const result = await service.signTransaction(mockTransaction);

    expect(result).toBe(signedTransaction);
    expect(service.signTransaction).toHaveBeenCalledWith(mockTransaction);
  });
});
