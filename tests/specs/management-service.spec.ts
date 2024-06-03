import * as anchor from '@coral-xyz/anchor';
import { LbpManagementService } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';

import { BUY_SELL_POOL_PDA, DEFAULT_PROGRAM_ADDRESS, MOCK_WALLET, TOKEN_A, TOKEN_B } from '../mocks/constants';

describe('LBP Management Service', () => {
  let connection: Connection;
  let provider: anchor.AnchorProvider;

  beforeEach(async () => {
    connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet), 'confirmed');
    provider = new anchor.AnchorProvider(connection, MOCK_WALLET, anchor.AnchorProvider.defaultOptions());
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('pool management operations', () => {
    let service: LbpManagementService;

    describe('pause/unpause operations', () => {
      beforeEach(async () => {
        service = new LbpManagementService(DEFAULT_PROGRAM_ADDRESS, provider, connection, true);
      });

      it('should create an instance of LbpManagementService', () => {
        expect(service).toBeInstanceOf(LbpManagementService);
      });
      it('should call pause and return the transaction instruction', async () => {
        const params = {
          poolPda: BUY_SELL_POOL_PDA,
          creator: MOCK_WALLET.publicKey,
          shareTokenMint: TOKEN_B,
          assetTokenMint: TOKEN_A,
        };

        const response = await service.pauseLbp(params);

        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);
      });

      it('should throw an error if pauseLbp is called by a non-creator', async () => {
        const params = {
          poolPda: BUY_SELL_POOL_PDA,
          creator: Keypair.generate().publicKey,
          shareTokenMint: TOKEN_B,
          assetTokenMint: TOKEN_A,
        };

        await expect(service.pauseLbp(params)).rejects.toThrow('Error: Creator does not match pool state');
      });

      it('should call unpause on an unpaused pool and throw an error', async () => {
        const params = {
          poolPda: BUY_SELL_POOL_PDA,
          creator: MOCK_WALLET.publicKey,
          shareTokenMint: TOKEN_B,
          assetTokenMint: TOKEN_A,
        };

        await expect(service.unPauseLbp(params)).rejects.toThrow('Error: The pool is already unpaused');
      });
    });
    describe('admin operations', () => {
      it('should create an instance of LbpManagementService', () => {
        expect(service).toBeInstanceOf(LbpManagementService);
      });
      describe('new owner operations', () => {
        beforeEach(async () => {
          service = new LbpManagementService(DEFAULT_PROGRAM_ADDRESS, provider, connection, true);
        });
        it('should call createNewOwnerNomination and return a transaction instruction', async () => {
          const params = {
            creator: MOCK_WALLET.publicKey,
            newOwnerPublicKey: Keypair.generate().publicKey,
          };

          const response = await service.createNewOwnerNomination(params);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);
        });
        it("should throw an error when the creator does not match the pool's owner", async () => {
          const params = {
            creator: Keypair.generate().publicKey,
            newOwnerPublicKey: Keypair.generate().publicKey,
          };

          await expect(service.createNewOwnerNomination(params)).rejects.toThrow(
            'Error: Creator does not match owner config',
          );
        });
        it('should call acceptOwnerNomination and create a transaction instruction when passed a valid public key', async () => {
          const params = {
            newOwnerPublicKey: Keypair.generate().publicKey,
          };

          const response = await service.acceptOwnerNomination(params);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);
        });
      });

      describe('pool fees operations', () => {
        beforeEach(async () => {
          service = new LbpManagementService(DEFAULT_PROGRAM_ADDRESS, provider, connection, true);
        });
        it("should throw an error when the creator does not match the pool's owner", async () => {
          const params = {
            ownerPublicKey: Keypair.generate().publicKey,
            platformFee: 20,
            referralFee: 20,
            swapFee: 20,
          };

          await expect(service.setPoolFees(params)).rejects.toThrow('Error: Creator does not match owner config');
        });
      });

      describe('set treasury fee operations', () => {
        beforeEach(async () => {
          service = new LbpManagementService(DEFAULT_PROGRAM_ADDRESS, provider, connection, true);
        });

        it('should call setTreasuryFeeRecipients and return a transaction instruction', async () => {
          const params = {
            creator: MOCK_WALLET.publicKey,
            swapFeeRecipient: Keypair.generate().publicKey,
            feeRecipients: [
              {
                feePercentage: 10,
                feeRecipient: Keypair.generate().publicKey,
              },
              {
                feePercentage: 20,
                feeRecipient: Keypair.generate().publicKey,
              },
            ],
          };

          const response = await service.setTreasuryFeeRecipients(params);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(anchor.web3.TransactionInstruction);
        });
        it('should throw an error when the creator does not match the pool owner', async () => {
          const params = {
            creator: Keypair.generate().publicKey,
            swapFeeRecipient: Keypair.generate().publicKey,
            feeRecipients: [
              {
                feePercentage: 10,
                feeRecipient: Keypair.generate().publicKey,
              },
              {
                feePercentage: 20,
                feeRecipient: Keypair.generate().publicKey,
              },
            ],
          };

          await expect(service.setTreasuryFeeRecipients(params)).rejects.toThrow(
            'Error: Creator does not match owner config',
          );
        });

        it('should throw an error when the total fee percentage exceeds 100%', async () => {
          const params = {
            creator: MOCK_WALLET.publicKey,
            swapFeeRecipient: Keypair.generate().publicKey,
            feeRecipients: [
              {
                feePercentage: 50,
                feeRecipient: Keypair.generate().publicKey,
              },
              {
                feePercentage: 60,
                feeRecipient: Keypair.generate().publicKey,
              },
            ],
          };

          await expect(service.setTreasuryFeeRecipients(params)).rejects.toThrow(
            'Error: Total fee percentage exceeds maximum',
          );
        });
      });
    });
  });
});
