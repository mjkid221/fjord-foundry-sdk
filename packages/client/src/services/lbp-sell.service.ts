import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { MAX_FEE_BASIS_POINTS, getAssociatedTokenAddress } from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { getTokenDivisor } from '../helpers';
import {
  BigNumber,
  LbpSellServiceInterface,
  SwapExactSharesForAssetsOperationParams,
  SwapSharesForExactAssetsOperationParams,
} from '../types';
import { base64ToBN } from '../utils';

import { Logger, LoggerLike } from './logger.service';

export class LbpSellService implements LbpSellServiceInterface {
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
    this.logger = Logger('LbpBuyService', loggerEnabled);
    this.logger.debug('LbpBuyService initialized');
  }

  /**
   * Asynchronously creates an instance of LbpSellService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {Connection} connection - The Solana network to use.
   * @returns {Promise<LbpBuyService>} - A promise that resolves with an instance of LbpSellService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    connection: Connection,
    loggerEnabled: boolean,
  ): Promise<LbpSellService> {
    const service = await Promise.resolve(new LbpSellService(programId, provider, connection, loggerEnabled));

    return service;
  }

  private async simulatePreviewsAndReturnValue(ix: TransactionInstruction, user: PublicKey): Promise<BigNumber> {
    const transactionSimulation = await this.connection.simulateTransaction(
      new VersionedTransaction(
        new TransactionMessage({
          payerKey: user,
          recentBlockhash: (await this.connection.getLatestBlockhash()).blockhash,
          instructions: [ix],
        }).compileToV0Message(),
      ),
    );

    if (transactionSimulation.value.err) {
      this.logger.error('Unable to simulate preview transaction', transactionSimulation.value.err);
      throw new Error('Unable to simulate preview transaction');
    }

    if (transactionSimulation.value.returnData?.data) {
      return base64ToBN(transactionSimulation?.value?.returnData?.data[0]);
    } else {
      // Read through all the transaction logs.
      const returnPrefix = `Program return: ${this.program.programId} `;
      const returnLogEntry = transactionSimulation.value.logs!.find((log) => log.startsWith(returnPrefix));

      if (returnLogEntry) {
        return base64ToBN(returnLogEntry.slice(returnPrefix.length));
      }
    }

    this.logger.error('Unable to find return data in logs');
    throw new Error('Unable to find return data in logs');
  }

  private async getTokenDivisorFromSupply(tokenMint: PublicKey, connection: Connection): Promise<number> {
    try {
      const tokenData = await connection.getTokenSupply(tokenMint);

      return getTokenDivisor(tokenData.value.decimals);
    } catch (error: any) {
      this.logger.error('Failed to get token divisor from supply.', error);
      throw new Error('Failed to get token divisor from supply.', error);
    }
  }

  public async previewAssetsOut({ keys, args }: SwapExactSharesForAssetsOperationParams) {
    const { userPublicKey, shareTokenMint, assetTokenMint } = keys;
    const { poolPda, sharesAmountIn } = args;
    let poolShareTokenAccount: PublicKey;
    let poolAssetTokenAccount: PublicKey;

    try {
      // Find the associated token accounts for the pool and creator.
      poolShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, poolPda, true);
      poolAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, poolPda, true);
    } catch (error: any) {
      this.logger.error('Failed to get associated token accounts for the pool and creator.', error);
      throw new Error('Failed to get associated token accounts for the pool and creator.', error);
    }

    try {
      const ix = await this.program.methods
        .previewAssetsOut(sharesAmountIn)
        .accounts({ assetTokenMint, shareTokenMint, pool: poolPda, poolAssetTokenAccount, poolShareTokenAccount })
        .instruction();

      const expectedMinAssetsOut = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);
      return {
        expectedMinAssetsOut,
        poolShareTokenAccount,
        poolAssetTokenAccount,
        sharesAmountIn,
      };
    } catch (error: any) {
      this.logger.error('Failed to create swap exact shares for assets instruction preview.', error);
      throw new Error('Failed to create swap exact shares for assets instruction preview.', error);
    }
  }

  public async previewSharesIn({ keys, args }: SwapSharesForExactAssetsOperationParams) {
    const { userPublicKey, shareTokenMint, assetTokenMint } = keys;
    const { poolPda, assetsAmountOut } = args;
    let poolShareTokenAccount: PublicKey;
    let poolAssetTokenAccount: PublicKey;

    try {
      // Find the associated token accounts for the pool and creator.
      poolShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, poolPda, true);
      poolAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, poolPda, true);
    } catch (error: any) {
      this.logger.error('Failed to get associated token accounts for the pool and creator.', error);
      throw new Error('Failed to get associated token accounts for the pool and creator.', error);
    }

    try {
      const ix = await this.program.methods
        .previewSharesIn(assetsAmountOut)
        .accounts({ assetTokenMint, shareTokenMint, pool: poolPda, poolAssetTokenAccount, poolShareTokenAccount })
        .instruction();

      const expectedMaxSharesIn = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);
      return {
        expectedMaxSharesIn,
        poolShareTokenAccount,
        poolAssetTokenAccount,
        assetsAmountOut,
      };
    } catch (error: any) {
      this.logger.error('Failed to create swap shares for exact assets instruction preview.', error);
      throw new Error('Failed to create swap shares for exact assets instruction preview.', error);
    }
  }

  public async createSwapExactSharesForAssetsInstruction({
    keys,
    args,
  }: SwapExactSharesForAssetsOperationParams): Promise<TransactionInstruction> {
    // Destructure the provided keys and arguments.
    const { userPublicKey, shareTokenMint, assetTokenMint } = keys;
    const { poolPda, expectedMinAssetsOut, sharesAmountIn } = args;

    let userPoolPda: PublicKey;

    try {
      // Get the user PDA for the pool.
      [userPoolPda] = findProgramAddressSync([userPublicKey.toBuffer(), poolPda.toBuffer()], this.program.programId);
    } catch (error: any) {
      this.logger.error('Failed to get user PDA for the pool.', error);
      throw new Error('Failed to get user PDA for the pool.', error);
    }
    const [ 
      userShareTokenAccount, 
      userAssetTokenAccount, 
      poolShareTokenAccount, 
      poolAssetTokenAccount
    ] = await Promise.all([
      getAssociatedTokenAddress(shareTokenMint, userPublicKey, true),
      getAssociatedTokenAddress(assetTokenMint, userPublicKey, true),
      getAssociatedTokenAddress(shareTokenMint, poolPda, true),
      getAssociatedTokenAddress(assetTokenMint, poolPda, true)
    ])

    // Create the instruction.
    try {
      const swapInstruction = await this.program.methods
        .swapExactSharesForAssets(sharesAmountIn, expectedMinAssetsOut, null, null)
        .accounts({
          assetTokenMint,
          shareTokenMint,
          user: userPublicKey,
          pool: poolPda,
          poolAssetTokenAccount,
          poolShareTokenAccount,
          userAssetTokenAccount,
          userShareTokenAccount,
          userStateInPool: userPoolPda,
          referrerStateInPool: null,
        })
        .instruction();

      return swapInstruction;
    } catch (error: any) {
      this.logger.error('Error creating swap instruction:', error);
      throw new Error('Error creating swap instruction', error);
    }
  }

  public async createSwapSharesForExactAssetsInstruction({
    keys,
    args,
  }: SwapSharesForExactAssetsOperationParams): Promise<TransactionInstruction> {
    // Destructure the provided keys and arguments.
    const { userPublicKey, shareTokenMint, assetTokenMint } = keys;
    const { poolPda, expectedMaxSharesIn, assetsAmountOut } = args;

    // Get the user PDA for the pool.
    const [userPoolPda] = findProgramAddressSync(
      [userPublicKey.toBuffer(), poolPda.toBuffer()],
      this.program.programId,
    );

    const [ 
      userShareTokenAccount, 
      userAssetTokenAccount, 
      poolShareTokenAccount, 
      poolAssetTokenAccount
    ] = await Promise.all([
      getAssociatedTokenAddress(shareTokenMint, userPublicKey, true),
      getAssociatedTokenAddress(assetTokenMint, userPublicKey, true),
      getAssociatedTokenAddress(shareTokenMint, poolPda, true),
      getAssociatedTokenAddress(assetTokenMint, poolPda, true)
    ])

    try {
      const swapInstruction = await this.program.methods
        .swapSharesForExactAssets(assetsAmountOut, expectedMaxSharesIn, null, null)
        .accounts({
          assetTokenMint,
          shareTokenMint,
          user: userPublicKey,
          pool: poolPda,
          poolAssetTokenAccount,
          poolShareTokenAccount,
          userAssetTokenAccount,
          userShareTokenAccount,
          userStateInPool: userPoolPda,
          referrerStateInPool: null,
        })
        .instruction();

      return swapInstruction;
    } catch (error: any) {
      this.logger.error('Error creating swap instruction:', error);
      throw new Error('Error creating swap instruction', error);
    }
  }
}
