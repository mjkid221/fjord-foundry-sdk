import * as anchor from '@coral-xyz/anchor';
import { LbpSellService } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl } from '@solana/web3.js';

import {
  BUY_SELL_POOL_PDA,
  DEFAULT_PROGRAM_ADDRESS,
  MOCK_WALLET,
  TEST_POOL_PDA,
  TOKEN_A,
  TOKEN_B,
} from '../mocks/constants';

describe('LBP Sell Service', () => {
  let connection: Connection;
  let provider: anchor.AnchorProvider;

  beforeEach(async () => {
    connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet), 'confirmed');
    provider = new anchor.AnchorProvider(connection, MOCK_WALLET, anchor.AnchorProvider.defaultOptions());
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('sell operations', () => {
    let service: LbpSellService;
    beforeEach(async () => {
      service = new LbpSellService(DEFAULT_PROGRAM_ADDRESS, provider, WalletAdapterNetwork.Devnet, true);
    });

    it('should create an instance of LbpSellService', () => {
      expect(service).toBeInstanceOf(LbpSellService);
    });

    it('should call swap exact shares for assets and return the transaction instruction', async () => {
      const keys = {
        userPublicKey: MOCK_WALLET.publicKey,
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_B,
        assetTokenMint: TOKEN_A,
      };

      const args = {
        sharesAmountIn: new anchor.BN(10),
        poolPda: BUY_SELL_POOL_PDA,
      };

      const response = await service.createSwapExactSharesForAssetsInstruction({ keys, args });

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);

      expect(response.keys).toHaveLength(14);
    });

    it('should call swap shares for exact assets and return the transaction instruction', async () => {
      const keys = {
        userPublicKey: MOCK_WALLET.publicKey,
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_B,
        assetTokenMint: TOKEN_A,
      };

      const args = {
        assetsAmountOut: new anchor.BN(10),
        poolPda: BUY_SELL_POOL_PDA,
      };

      const response = await service.createSwapSharesForExactAssetsInstruction({ keys, args });

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);

      expect(response.keys).toHaveLength(14);
    });

    it('should not create a transaction instruction when called with an incorrect poolPDA', async () => {
      const keys = {
        userPublicKey: MOCK_WALLET.publicKey,
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_B,
        assetTokenMint: TOKEN_A,
      };

      const args = {
        assetsAmountOut: new anchor.BN(10),
        poolPda: TEST_POOL_PDA,
      };

      await expect(service.createSwapSharesForExactAssetsInstruction({ keys, args })).rejects.toThrow(
        'Invalid pool PDA - input poolPda does not match the expected pool PDA.',
      );
    });
  });
});
