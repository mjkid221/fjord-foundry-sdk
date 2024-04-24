import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Connection, TransactionInstruction } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { LbpManagementServiceInterface, PausePoolParams } from '../types';

import { LoggerLike, Logger } from './logger.service';

export class LbpManagementService implements LbpManagementServiceInterface {
  private provider: anchor.Provider;

  private programId: PublicKey;

  private program: anchor.Program<FjordLbp>;

  private connection: Connection;

  private network: WalletAdapterNetwork;

  private logger: LoggerLike;

  constructor(programId: PublicKey, provider: anchor.AnchorProvider, network: WalletAdapterNetwork) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
    this.connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl(network));
    this.network = network;
    this.logger = Logger('LbpManagementService', true);
    this.logger.debug('LbpManagementService initialized');
  }

  /**
   * Retrieves the Program Derived Address (PDA) for the pool.
   * @param {PublicKey} shareTokenMint - The public key of the mint for the pool's share tokens.
   * @param {PublicKey} assetTokenMint - The public key of the mint for the pool's underlying asset.
   * @param {PublicKey} creator - The public key of the wallet that created the pool.
   * @returns {Promise<PublicKey>} - A promise that resolves with the Program Derived Address (PDA) of the pool.
   */
  private async getPoolPda(
    shareTokenMint: PublicKey,
    assetTokenMint: PublicKey,
    creator: PublicKey,
  ): Promise<PublicKey> {
    const [poolPda] = findProgramAddressSync(
      [shareTokenMint.toBuffer(), assetTokenMint.toBuffer(), creator.toBuffer()],
      this.program.programId,
    );

    return poolPda;
  }

  /**
   * Asynchronously creates an instance of LbpManagementService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {WalletAdapterNetwork} network - The Solana network.
   * @returns {Promise<LbpBuyService>} - A promise that resolves with an instance of LbpManagementService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
  ): Promise<LbpManagementService> {
    const service = await Promise.resolve(new LbpManagementService(programId, provider, network));

    return service;
  }

  public async pauseLbp({
    poolPda,
    creator,
    shareTokenMint,
    assetTokenMint,
  }: PausePoolParams): Promise<TransactionInstruction> {
    // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
    const poolPdaFromParams = await this.getPoolPda(shareTokenMint, assetTokenMint, creator);

    // Verify that the provided pool PDA matches the calculated pool PDA.
    if (!poolPda.equals(poolPdaFromParams)) {
      this.logger.error('Provided pool PDA does not match calculated pool PDA');
      throw new Error('Provided pool PDA does not match calculated pool PDA');
    }

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

    // Create the pause pool transaction
    try {
      const transactionInstruction = await this.program.methods
        .togglePause()
        .accounts({ creator, pool: poolPda, assetTokenMint, shareTokenMint })
        .instruction();

      return transactionInstruction;
    } catch (error) {
      this.logger.error('Error pausing pool', error);
      throw new Error('Error pausing pool');
    }
  }

  public async unPauseLbp({
    poolPda,
    creator,
    shareTokenMint,
    assetTokenMint,
  }: PausePoolParams): Promise<TransactionInstruction> {
    // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
    const poolPdaFromParams = await this.getPoolPda(shareTokenMint, assetTokenMint, creator);

    // Verify that the provided pool PDA matches the calculated pool PDA.
    if (!poolPda.equals(poolPdaFromParams)) {
      this.logger.error('Provided pool PDA does not match calculated pool PDA');
      throw new Error('Provided pool PDA does not match calculated pool PDA');
    }

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

    // Create the unpause pool transaction
    try {
      const transactionInstruction = await this.program.methods
        .togglePause()
        .accounts({ creator, pool: poolPda, assetTokenMint, shareTokenMint })
        .instruction();

      return transactionInstruction;
    } catch (error) {
      this.logger.error('Error unpausing pool', error);
      throw new Error('Error unpausing pool');
    }
  }
}
