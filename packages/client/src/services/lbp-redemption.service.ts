import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Connection, Transaction, AccountMeta } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { getPoolPda } from '../helpers/getPoolPda';
import { CloseOperationPublicKeys, LbpRedemptionServiceInterface, RedeemOperationPublicKeys } from '../types';

import { Logger, LoggerLike } from './logger.service';

export class LbpRedemptionService implements LbpRedemptionServiceInterface {
  private provider: anchor.Provider;

  private programId: PublicKey;

  private program: anchor.Program<FjordLbp>;

  private connection: Connection;

  private network: WalletAdapterNetwork;

  private logger: LoggerLike;

  constructor(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
    loggerEnabled: boolean,
  ) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
    this.connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl(network));
    this.network = network;
    this.logger = Logger('LbpRedemptionService', loggerEnabled);
    this.logger.debug('LbpRedemptionService initialized');
  }

  /**
   * Asynchronously creates an instance of LbpRedemptionService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {WalletAdapterNetwork} network - The Solana network.
   * @returns {Promise<LbpRedemptionService>} - A promise that resolves with an instance of LbpRedemptionService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
    loggerEnabled: boolean,
  ): Promise<LbpRedemptionService> {
    const service = await Promise.resolve(new LbpRedemptionService(programId, provider, network, loggerEnabled));

    return service;
  }

  /**
   * Asynchronously creates an instruction to close an LBP pool.
   * @dev This function can only be called by the pool creator after the sale period is over, otherwise will revert.
   */
  public async closeLbpPool({ keys, args }: Omit<CloseOperationPublicKeys, 'provider' | 'programId'>) {
    // Destructure the provided keys and arguments.

    const { userPublicKey, creator, shareTokenMint, assetTokenMint } = keys;

    const { poolPda } = args;

    let poolPdaFromParams: PublicKey;
    try {
      // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
      poolPdaFromParams = await getPoolPda({ shareTokenMint, assetTokenMint, creator, programId: this.programId });
    } catch (error: any) {
      this.logger.error('Error getting pool PDA:', error);
      throw new Error('Error getting pool PDA', error);
    }

    // Check that the poolPda is valid.
    if (!poolPda.equals(poolPdaFromParams)) {
      this.logger.error('Invalid pool PDA - input poolPda does not match the expected pool PDA.');
      throw new Error('Invalid pool PDA - input poolPda does not match the expected pool PDA.');
    }

    // Get the treasury account
    const [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], this.program.programId);
    const [ownerConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('owner_config')], this.program.programId);

    // Get the user pool account
    const treasury = await this.program.account.treasury.fetch(treasuryPda);

    // Get fee recipient informations.
    // !NOTE - There are two types of fee recipients in the treasury.
    // 1. Swap fee recipient - This is a single user who will receive the swap fees in asset and share token.
    // 2. Fee recipients - These are the array of users who will receive a set fee (in asset token) based on the percentage set.
    const { feeRecipients, swapFeeRecipient } = treasury;
    const [
      poolShareTokenAccount,
      poolAssetTokenAccount,
      swapFeeRecipientAssetTokenAccount,
      swapFeeRecipientShareTokenAccount,
      treasuryAssetTokenAccount,
      treasuryShareTokenAccount,
      creatorAssetTokenAccount,
      creatorShareTokenAccount,
    ] = await Promise.all([
      getAssociatedTokenAddressSync(shareTokenMint, poolPda, true),
      getAssociatedTokenAddressSync(assetTokenMint, poolPda, true),
      getAssociatedTokenAddressSync(assetTokenMint, swapFeeRecipient),
      getAssociatedTokenAddressSync(shareTokenMint, swapFeeRecipient),
      getAssociatedTokenAddressSync(assetTokenMint, treasuryPda, true),
      getAssociatedTokenAddressSync(shareTokenMint, treasuryPda, true),
      getAssociatedTokenAddressSync(assetTokenMint, creator),
      getAssociatedTokenAddressSync(shareTokenMint, creator),
    ]);

    // Add instructions to create asset token accounts for recipient atas if they dont exist
    const preInstructions = new Transaction();
    const recipientAccountsSetup: Array<AccountMeta> = [];
    const promises: Promise<void>[] = [];

    [assetTokenMint].forEach((token) => {
      feeRecipients.forEach(({ user: recipient }) => {
        const promise = getAssociatedTokenAddress(token, recipient, true).then(async (recipientAta) => {
          try {
            // This should throw an error if the account doesn't exist
            await getAccount(this.connection, recipientAta);
          } catch {
            // Add instruction to create one
            preInstructions.add(
              createAssociatedTokenAccountInstruction(
                userPublicKey, // fee payer
                recipientAta, // recipient's associated token account
                recipient, // recipient's public key
                token, // token mint address
              ),
            );
          }
          // Add extra recipient accounts to the accounts array for our program to use as a reference
          recipientAccountsSetup.push({
            pubkey: recipientAta,
            isWritable: true,
            isSigner: false,
          });
        });
        promises.push(promise);
      });
    });

    // Wait for all promises to complete
    await Promise.all(promises);

    try {
      const closeInstruction = await this.program.methods
        .closePool()
        .accounts({
          assetTokenMint,
          shareTokenMint,
          pool: poolPda,
          poolAssetTokenAccount,
          poolShareTokenAccount,
          treasuryAssetTokenAccount,
          treasuryShareTokenAccount,
          treasury: treasuryPda,
          creatorAssetTokenAccount,
          creatorShareTokenAccount,
          ownerConfig: ownerConfigPda,
          user: userPublicKey,
          poolCreator: creator,
          swapFeeRecipientAssetTokenAccount,
          swapFeeRecipientShareTokenAccount,
          swapFeeRecipient: treasury.swapFeeRecipient,
        })
        .remainingAccounts(recipientAccountsSetup)
        .instruction();

      return [...preInstructions.instructions, closeInstruction];
    } catch (error: any) {
      this.logger.error('Error creating close instruction:', error);
      throw new Error('Error creating close instruction', error);
    }
  }

  /**
   * Asynchronously creates an instruction to redeem LBP tokens.
   * @dev This function can be called by anyone to retrieve their eligible purchased shares after the pool is closed.
   */
  public async redeemLbpTokens({ keys, args }: Omit<RedeemOperationPublicKeys, 'provider' | 'programId'>) {
    // Destructure the provided keys and arguments.
    const { userPublicKey, creator, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, isReferred } = args;

    let poolPdaFromParams: PublicKey;
    try {
      // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
      poolPdaFromParams = await getPoolPda({ shareTokenMint, assetTokenMint, creator, programId: this.programId });
    } catch (error: any) {
      this.logger.error('Error getting pool PDA:', error);
      throw new Error('Error getting pool PDA', error);
    }

    // Check that the poolPda is valid.
    if (!poolPda.equals(poolPdaFromParams)) {
      this.logger.error('Invalid pool PDA - input poolPda does not match the expected pool PDA.');
      throw new Error('Invalid pool PDA - input poolPda does not match the expected pool PDA.');
    }

    // Get the user PDA for the pool.
    const [userPoolPda] = findProgramAddressSync(
      [userPublicKey.toBuffer(), poolPda.toBuffer()],
      this.program.programId,
    );

    const [poolShareTokenAccount, poolAssetTokenAccount, userAssetTokenAccount, userShareTokenAccount] =
      await Promise.all([
        getAssociatedTokenAddressSync(shareTokenMint, poolPda, true),
        getAssociatedTokenAddressSync(assetTokenMint, poolPda, true),
        getAssociatedTokenAddressSync(assetTokenMint, userPublicKey),
        getAssociatedTokenAddressSync(shareTokenMint, userPublicKey),
      ]);

    try {
      const redeemInstructions = await this.program.methods
        .redeem(isReferred)
        .accounts({
          assetTokenMint,
          shareTokenMint,
          pool: poolPda,
          poolAssetTokenAccount,
          poolShareTokenAccount,
          user: userPublicKey,
          userAssetTokenAccount,
          userShareTokenAccount,
          userStateInPool: userPoolPda,
        })
        .instruction();

      return redeemInstructions;
    } catch (error: any) {
      this.logger.error('Error creating redeem instruction:', error);
      throw new Error('Error creating redeem instruction', error);
    }
  }
}
