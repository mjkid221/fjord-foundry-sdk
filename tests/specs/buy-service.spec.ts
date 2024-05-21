import * as anchor from '@coral-xyz/anchor';
import { LbpBuyService } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl } from '@solana/web3.js';

import { BUY_SELL_POOL_PDA, DEFAULT_PROGRAM_ADDRESS, MOCK_WALLET, TOKEN_A, TOKEN_B } from '../mocks/constants';

describe('LBP Buy Service', () => {
  let connection: Connection;
  let provider: anchor.AnchorProvider;

  beforeEach(async () => {
    connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet), 'confirmed');
    provider = new anchor.AnchorProvider(connection, MOCK_WALLET, anchor.AnchorProvider.defaultOptions());
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('buy operations', () => {
    let service: LbpBuyService;
    beforeEach(async () => {
      service = new LbpBuyService(DEFAULT_PROGRAM_ADDRESS, provider, WalletAdapterNetwork.Devnet, true);
    });

    it('should create an instance of LbpBuyService', () => {
      expect(service).toBeInstanceOf(LbpBuyService);
    });

    it('should call swap assets for exact shares and return the transaction instruction', async () => {
      const keys = {
        userPublicKey: MOCK_WALLET.publicKey,
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_B,
        assetTokenMint: TOKEN_A,
      };

      const args = {
        sharesAmountOut: new anchor.BN(10),
        poolPda: BUY_SELL_POOL_PDA,
      };

      const response = await service.createSwapAssetsForExactSharesInstruction({ keys, args });

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);

      expect(response.keys).toHaveLength(14);
    });

    it('should call swap exact assets for shares and return the transaction instruction', async () => {
      const keys = {
        userPublicKey: MOCK_WALLET.publicKey,
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_B,
        assetTokenMint: TOKEN_A,
      };

      const args = {
        assetsAmountIn: new anchor.BN(10),
        poolPda: BUY_SELL_POOL_PDA,
      };

      const response = await service.createSwapExactAssetsForSharesInstruction({ keys, args });

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);

      expect(response.keys).toHaveLength(14);
    });
  });
});
