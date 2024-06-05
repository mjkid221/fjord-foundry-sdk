import * as anchor from '@coral-xyz/anchor';
import { LbpInitializationService } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Connection, clusterApiUrl, TransactionInstruction } from '@solana/web3.js';

import {
  DEFAULT_SALE_START_TIME_BN,
  DEFAULT_SALE_END_TIME_BN,
  DEFAULT_PROGRAM_ADDRESS,
  MOCK_WALLET,
  TOKEN_A,
  TOKEN_B,
} from '../mocks/constants';

describe('LBP Initialization Service', () => {
  let connection: Connection;
  let provider: anchor.AnchorProvider;

  beforeEach(async () => {
    connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet), 'confirmed');
    provider = new anchor.AnchorProvider(connection, MOCK_WALLET, anchor.AnchorProvider.defaultOptions());
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializePool', () => {
    let service: LbpInitializationService;
    beforeEach(async () => {
      service = new LbpInitializationService(DEFAULT_PROGRAM_ADDRESS, provider, connection);
    });

    // Test if the class is defined
    it('should create an instance of LbpInitializationService', () => {
      expect(service).toBeInstanceOf(LbpInitializationService);
    });
    it('should initialize the pool with the provided parameters and return the transaction instruction and pool PDA', async () => {
      const keys = {
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_A,
        assetTokenMint: TOKEN_B,
      };

      const args = {
        assets: new anchor.BN(100),
        shares: new anchor.BN(100),
        virtualAssets: new anchor.BN(0),
        virtualShares: new anchor.BN(0),
        maxSharePrice: new anchor.BN(100),
        maxSharesOut: new anchor.BN(100),
        maxAssetsIn: new anchor.BN(1000),
        saleStartTime: DEFAULT_SALE_START_TIME_BN,
        saleEndTime: DEFAULT_SALE_END_TIME_BN,
        startWeightBasisPoints: 1000,
        endWeightBasisPoints: 2000,
      };

      const response = await service.initializePool({ keys, args });

      expect(response).toHaveProperty('transactionInstruction');
      expect(response).toHaveProperty('poolPda');
      expect(response.transactionInstruction).toBeInstanceOf(TransactionInstruction);
      expect(response.poolPda).toBeInstanceOf(PublicKey);
      expect(response.transactionInstruction.keys).toHaveLength(11);
    });

    it('should throw an error if initial assets exceed max assets in', async () => {
      const keys = {
        creator: MOCK_WALLET.publicKey,
        shareTokenMint: TOKEN_A,
        assetTokenMint: TOKEN_B,
      };

      const args = {
        assets: new anchor.BN(100),
        shares: new anchor.BN(100),
        virtualAssets: new anchor.BN(0),
        virtualShares: new anchor.BN(0),
        maxSharePrice: new anchor.BN(100),
        maxSharesOut: new anchor.BN(100),
        maxAssetsIn: new anchor.BN(99),
        saleStartTime: DEFAULT_SALE_START_TIME_BN,
        saleEndTime: DEFAULT_SALE_END_TIME_BN,
        startWeightBasisPoints: 1000,
        endWeightBasisPoints: 2000,
      };

      await expect(service.initializePool({ keys, args })).rejects.toThrow(
        'Initial assets cannot exceed max assets in',
      );
    });
  });
});
