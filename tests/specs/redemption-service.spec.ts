import * as anchor from '@coral-xyz/anchor';
import { LbpRedemptionService } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl } from '@solana/web3.js';

import { BUY_SELL_POOL_PDA, DEFAULT_PROGRAM_ADDRESS, MOCK_WALLET, TOKEN_A, TOKEN_B } from '../mocks/constants';

describe('LBP Redemption Service', () => {
  let connection: Connection;
  let provider: anchor.AnchorProvider;

  beforeEach(async () => {
    connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet), 'confirmed');
    provider = new anchor.AnchorProvider(connection, MOCK_WALLET, anchor.AnchorProvider.defaultOptions());
  });
  describe('close operations', () => {
    let service: LbpRedemptionService;
    beforeEach(async () => {
      service = new LbpRedemptionService(DEFAULT_PROGRAM_ADDRESS, provider, connection, true);
    });

    it('should create an instance of LbpRedemptionService', () => {
      expect(service).toBeInstanceOf(LbpRedemptionService);
    });

    it('should call close and return the transaction instruction', async () => {
      const keys = {
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_B,
        assetTokenMint: TOKEN_A,
        userPublicKey: MOCK_WALLET.publicKey,
      };

      const args = { poolPda: BUY_SELL_POOL_PDA };

      const response = await service.closeLbpPool({ keys, args });

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Array);
      for (const instruction of response) {
        expect(instruction).toBeInstanceOf(anchor.web3.TransactionInstruction);
      }
    });

    it('should call redeem and return the transaction instruction', async () => {
      const keys = {
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_B,
        assetTokenMint: TOKEN_A,
        userPublicKey: MOCK_WALLET.publicKey,
      };

      const args = { poolPda: BUY_SELL_POOL_PDA, isReferred: false };

      const response = await service.redeemLbpTokens({ keys, args });

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);
    });
  });
});
