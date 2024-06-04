import * as anchor from '@coral-xyz/anchor';
import { LbpReadService } from '@fjord-foundry/solana-sdk-client';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import { BUY_SELL_POOL_PDA, DEFAULT_PROGRAM_ADDRESS, MOCK_WALLET } from '../mocks/constants';
describe('LBP Read Service', () => {
  let connection: Connection;
  let provider: anchor.AnchorProvider;
  let service: LbpReadService;
  beforeEach(async () => {
    connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    provider = new anchor.AnchorProvider(connection, MOCK_WALLET, anchor.AnchorProvider.defaultOptions());
    service = new LbpReadService(DEFAULT_PROGRAM_ADDRESS, provider, connection, true);
  });

  describe('read operations for governing program', () => {
    describe('getOwnerConfig', () => {
      it('should call getPoolFees and return the correct response', async () => {
        const response = await service.getPoolFees();
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(Object);
        expect(response).toHaveProperty('platformFee');
        expect(response).toHaveProperty('referralFee');
        expect(response).toHaveProperty('swapFee');
        expect(typeof response.platformFee).toBe('number');
        expect(typeof response.referralFee).toBe('number');
        expect(typeof response.swapFee).toBe('number');
      });
      it('Should be able to get pool events', async () => {
        const eventName = 'Buy';
        const poolEvents = await service.getPoolLogsAfterSlot({
          poolPda: new PublicKey('7neo6rTQDuFBxaUspda6UVBEXxk3VAFRdvu73f4oot44'),
          afterSlot: 303401446,
          logName: eventName,
        });

        expect(poolEvents.length).toBeGreaterThan(0);
        poolEvents.map((event) => {
          expect(event).toBeInstanceOf(eventName);
        });
      });
    });
    describe('getPoolOwner', () => {
      it('should call getPoolOwner and return the correct response', async () => {
        const response = await service.getPoolOwner();
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(PublicKey);
      });
    });
    describe('getFeeRecipients', () => {
      it('should call getFeeRecipients and return the correct response', async () => {
        const response = await service.getFeeRecipients();
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(Array);
        expect(response[0]).toHaveProperty('user');
        expect(response[0]).toHaveProperty('percentage');
        expect(response[0].user).toBeInstanceOf(PublicKey);
        expect(typeof response[0].percentage).toBe('number');
      });
    });
    describe('getSwapFeeRecipient', () => {
      it('should call getSwapFeeRecipient and return the correct response', async () => {
        const response = await service.getSwapFeeRecipient();
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(PublicKey);
      });
    });
  });

  describe('read operations for an individual LBP', () => {
    const poolPda = { poolPda: BUY_SELL_POOL_PDA };
    describe('getPoolTokenAccounts', () => {
      it('should call getPoolTokenAccounts and return the correct response', async () => {
        const response = await service.getPoolTokenAccounts({ ...poolPda });
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(Object);
        expect(response).toHaveProperty('poolShareTokenAccount');
        expect(response).toHaveProperty('poolAssetTokenAccount');
        expect(response.poolShareTokenAccount).toBeInstanceOf(PublicKey);
        expect(response.poolAssetTokenAccount).toBeInstanceOf(PublicKey);
      });
    });
    describe('getPoolTokenBalances', () => {
      it('should call getPoolTokenBalances and return the correct response', async () => {
        const response = await service.getPoolTokenBalances({ ...poolPda });
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(Object);
        expect(response).toHaveProperty('poolShareTokenBalance');
        expect(response).toHaveProperty('poolAssetTokenBalance');
        expect(typeof response.poolShareTokenBalance).toBe('string');
        expect(typeof response.poolAssetTokenBalance).toBe('string');
      });
    });
    describe('getCreatorTokenBalances', () => {
      it('should call getCreatorTokenBalances and return the correct response', async () => {
        const response = await service.getCreatorTokenBalances({ ...poolPda });
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(Object);
        expect(response).toHaveProperty('creatorShareTokenBalance');
        expect(response).toHaveProperty('creatorAssetTokenBalance');
        expect(typeof response.creatorShareTokenBalance).toBe('string');
        expect(typeof response.creatorAssetTokenBalance).toBe('string');
      });
    });
    describe('getUserPoolStateBalances', () => {
      it('should call getUserPoolStateBalances and return the correct response', async () => {
        const response = await service.getUserPoolStateBalances({ ...poolPda, userPublicKey: MOCK_WALLET.publicKey });
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(Object);
        expect(response).toHaveProperty('purchasedShares');
        expect(response).toHaveProperty('redeemedShares');
        expect(response).toHaveProperty('referredAssets');
        expect(typeof response.purchasedShares).toBe('string');
        expect(typeof response.redeemedShares).toBe('string');
        expect(typeof response.referredAssets).toBe('string');
      });

      it('should throw an error when the user has no balance', async () => {
        await expect(
          service.getUserPoolStateBalances({ ...poolPda, userPublicKey: Keypair.generate().publicKey }),
        ).rejects.toThrow('Error: Account does not exist or has no data');
      });
    });
  });
});
