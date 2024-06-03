import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { MAX_FEE_BASIS_POINTS } from '@solana/spl-token';
import { PublicKey, Connection, TransactionInstruction } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { LbpManagementServiceInterface, NewFeeParams, PausePoolParams, SetTreasuryFeeRecipientsParams } from '../types';

import { LoggerLike, Logger } from './logger.service';

export class LbpManagementService implements LbpManagementServiceInterface {
  private provider: anchor.Provider;

  private programId: PublicKey;

  private program: anchor.Program<FjordLbp>;

  private connection: Connection;

  private logger: LoggerLike;

  constructor(programId: PublicKey, provider: anchor.AnchorProvider, connection: Connection, loggerEnabled: boolean) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
    this.connection = connection;
    this.logger = Logger('LbpManagementService', loggerEnabled);
    this.logger.debug('LbpManagementService initialized');
  }

  /**
   * Asynchronously creates an instance of LbpManagementService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {anchor.AnchorProvider} provider - The Anchor provider object.
   * @param {WalletAdapterNetwork} network - The Solana network.
   * @returns {Promise<LbpBuyService>} - A promise that resolves with an instance of LbpManagementService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    connection: Connection,
    loggerEnabled: boolean,
  ): Promise<LbpManagementService> {
    const service = await Promise.resolve(new LbpManagementService(programId, provider, connection, loggerEnabled));

    return service;
  }

  public async pauseLbp({
    poolPda,
    creator,
    shareTokenMint,
    assetTokenMint,
  }: PausePoolParams): Promise<TransactionInstruction> {
    // Create the pause pool transaction
    try {
      // Get the pool state
      const poolState = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

      // Check if the pool is already paused
      if (poolState.paused) {
        this.logger.error('The pool is already paused');
        throw new Error('The pool is already paused');
      }

      // Check that the creator, share token mint, and asset token mint match the pool state
      if (!creator.equals(poolState.creator)) {
        this.logger.error('Creator does not match pool state');
        throw new Error('Creator does not match pool state');
      }

      if (!shareTokenMint.equals(poolState.shareToken)) {
        this.logger.error('Share token mint does not match pool state');
        throw new Error('Share token mint does not match pool state');
      }

      if (!assetTokenMint.equals(poolState.assetToken)) {
        this.logger.error('Asset token mint does not match pool state');
        throw new Error('Asset token mint does not match pool state');
      }

      const transactionInstruction = await this.program.methods
        .togglePause()
        .accounts({ creator, pool: poolPda, assetTokenMint, shareTokenMint })
        .instruction();

      return transactionInstruction;
    } catch (error: any) {
      this.logger.error('Error pausing pool', error);
      throw new Error(error);
    }
  }

  public async unPauseLbp({
    poolPda,
    creator,
    shareTokenMint,
    assetTokenMint,
  }: PausePoolParams): Promise<TransactionInstruction> {
    // Create the unpause pool transaction
    try {
      // Get the pool state
      const poolState = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

      // Check if the pool is already unpaused
      if (!poolState.paused) {
        this.logger.error('The pool is already unpaused');
        throw new Error('The pool is already unpaused');
      }

      // Check that the creator, share token mint, and asset token mint match the pool state
      if (!creator.equals(poolState.creator)) {
        this.logger.error('Creator does not match pool state');
        throw new Error('Creator does not match pool state');
      }

      if (!shareTokenMint.equals(poolState.shareToken)) {
        this.logger.error('Share token mint does not match pool state');
        throw new Error('Share token mint does not match pool state');
      }

      if (!assetTokenMint.equals(poolState.assetToken)) {
        this.logger.error('Asset token mint does not match pool state');
        throw new Error('Asset token mint does not match pool state');
      }

      const transactionInstruction = await this.program.methods
        .togglePause()
        .accounts({ creator, pool: poolPda, assetTokenMint, shareTokenMint })
        .instruction();

      return transactionInstruction;
    } catch (error: any) {
      this.logger.error('Error unpausing pool', error);
      throw new Error(error);
    }
  }

  public async createNewOwnerNomination({
    newOwnerPublicKey,
    creator,
  }: {
    newOwnerPublicKey: PublicKey;
    creator: PublicKey;
  }): Promise<TransactionInstruction> {
    if (!creator) {
      this.logger.error('No creator provided');
      throw new Error('No creator provided');
    }

    try {
      // Get the program address for the owner config
      const [configPda] = findProgramAddressSync([Buffer.from('owner_config')], this.program.programId);
      // Get the owner config
      const ownerConfig = await this.program.account.ownerConfig.fetch(configPda);

      // Verify that the creator matches the owner config
      if (!ownerConfig.owner.equals(creator)) {
        this.logger.error('Creator does not match owner config');
        throw new Error('Creator does not match owner config');
      }
      const transactionInstruction = await this.program.methods
        .nominateNewOwner(newOwnerPublicKey)
        .accounts({})
        .instruction();

      return transactionInstruction;
    } catch (error: any) {
      this.logger.error('Error nominating new owner', error);
      throw new Error(error);
    }
  }

  public async acceptOwnerNomination({
    newOwnerPublicKey,
  }: {
    newOwnerPublicKey: PublicKey;
  }): Promise<TransactionInstruction> {
    try {
      const transactionInstruction = await this.program.methods
        .acceptNewOwner()
        .accounts({ newOwner: newOwnerPublicKey })
        .instruction();

      return transactionInstruction;
    } catch (error: any) {
      this.logger.error('Error accepting new owner', error);
      throw new Error(error);
    }
  }

  public async setPoolFees({
    platformFee,
    referralFee,
    swapFee,
    ownerPublicKey,
  }: NewFeeParams): Promise<TransactionInstruction> {
    if (!platformFee && !referralFee && !swapFee) {
      this.logger.error('No fees provided');
      throw new Error('No fees provided');
    }

    try {
      // Get the program address for the owner config
      const [configPda] = findProgramAddressSync([Buffer.from('owner_config')], this.program.programId);

      // Get the owner config
      const ownerConfig = await this.program.account.ownerConfig.fetch(configPda);

      // Verify that the creator matches the owner config
      if (!ownerConfig.owner.equals(ownerPublicKey)) {
        this.logger.error('Creator does not match owner config');
        throw new Error('Creator does not match owner config');
      }

      const formattedFee = (fee: number | undefined) => (fee ? fee * 100 : null); // Convert fee to basis points
      const transactionInstruction = await this.program.methods
        .setFees(formattedFee(platformFee), formattedFee(referralFee), formattedFee(swapFee))
        .accounts({ owner: ownerPublicKey })
        .instruction();

      return transactionInstruction;
    } catch (error: any) {
      this.logger.error('Error setting fees', error);
      throw new Error(error);
    }
  }

  public async setTreasuryFeeRecipients({
    swapFeeRecipient,
    feeRecipients,
    creator,
  }: SetTreasuryFeeRecipientsParams): Promise<TransactionInstruction> {
    try {
      // Get the treasury PDA
      const [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], this.program.programId);

      const newFeeRecipients: PublicKey[] = [];
      const newFeePercentages: number[] = [];

      for (const feeRecipient of feeRecipients) {
        newFeeRecipients.push(feeRecipient.feeRecipient);
        newFeePercentages.push(feeRecipient.feePercentage * 100); // Convert percentage to basis points
      }

      // Ensure that the total fee percentage does not exceed the maximum
      if (newFeePercentages.reduce((a, b) => a + b, 0) > MAX_FEE_BASIS_POINTS) {
        this.logger.error('Total fee percentage exceeds maximum');
        throw new Error('Total fee percentage exceeds maximum');
      }

      // Get the program address for the owner config
      const [configPda] = findProgramAddressSync([Buffer.from('owner_config')], this.program.programId);

      // Get the owner config
      const ownerConfig = await this.program.account.ownerConfig.fetch(configPda);

      // Verify that the creator matches the owner config
      if (!ownerConfig.owner.equals(creator)) {
        this.logger.error('Creator does not match owner config');
        throw new Error('Creator does not match owner config');
      }

      // Create the transaction instruction
      const transactionInstruction = await this.program.methods
        .setTreasuryFeeRecipients(swapFeeRecipient, newFeeRecipients, newFeePercentages)
        .accounts({ owner: creator, treasury: treasuryPda })
        .instruction();

      return transactionInstruction;
    } catch (error: any) {
      this.logger.error('Error setting treasury fee recipients', error);
      throw new Error(error);
    }
  }
}
