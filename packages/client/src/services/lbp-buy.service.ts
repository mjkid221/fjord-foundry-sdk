import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { MAX_FEE_BASIS_POINTS, getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import { FjordLbp, IDL, SOLANA_RPC } from '../constants';
import { getTokenDivisor } from '../helpers';
import {
  BigNumber,
  LbpBuyServiceInterface,
  SwapAssetsForExactSharesOperationParams,
  SwapExactAssetsForSharesOperationParams,
} from '../types';
import { base64ToBN } from '../utils';

import { Logger, LoggerLike } from './logger.service';

export class LbpBuyService implements LbpBuyServiceInterface {
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
    this.connection = new anchor.web3.Connection(SOLANA_RPC || anchor.web3.clusterApiUrl(network));
    this.network = network;
    this.logger = Logger('LbpBuyService', loggerEnabled);
    this.logger.debug('LbpBuyService initialized');
  }

  /**
   * Asynchronously creates an instance of LbpBuyService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {WalletAdapterNetwork} network - The Solana network.
   * @returns {Promise<LbpBuyService>} - A promise that resolves with an instance of LbpBuyService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
    loggerEnabled: boolean,
  ): Promise<LbpBuyService> {
    const service = await Promise.resolve(new LbpBuyService(programId, provider, network, loggerEnabled));

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

  public async previewSharesOut({ keys, args }: SwapExactAssetsForSharesOperationParams) {
    // Destructure the provided keys and arguments.
    const { userPublicKey, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, assetsAmountIn } = args;

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

    const [assetTokenDivisor, shareTokenDivisor] = await Promise.all([
      this.getTokenDivisorFromSupply(assetTokenMint, this.connection),
      this.getTokenDivisorFromSupply(shareTokenMint, this.connection),
    ]);
    const formattedAssetsAmountIn: BigNumber = assetsAmountIn.mul(new anchor.BN(assetTokenDivisor));

    try {
      const ix = await this.program.methods
        .previewSharesOut(
          // Assets In
          formattedAssetsAmountIn,
        )
        .accounts({
          assetTokenMint,
          shareTokenMint,
          pool: poolPda,
          poolAssetTokenAccount,
          poolShareTokenAccount,
        })
        .instruction();

      const expectedSharesOut = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);

      return {
        expectedSharesOut,
        expectedSharesOutUI: expectedSharesOut.div(new anchor.BN(shareTokenDivisor)).toString(),
        poolShareTokenAccount,
        poolAssetTokenAccount,
        formattedAssetsAmountIn,
      };
    } catch (error: any) {
      this.logger.error('Failed to create shares out preview', error);
      throw new Error('Failed to create shares out preview.', error);
    }
  }

  public async previewAssetsIn({ keys, args }: SwapAssetsForExactSharesOperationParams) {
    // Destructure the provided keys and arguments.
    const { userPublicKey, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, sharesAmountOut } = args;

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

    const [assetTokenDivisor, shareTokenDivisor] = await Promise.all([
      this.getTokenDivisorFromSupply(assetTokenMint, this.connection),
      this.getTokenDivisorFromSupply(shareTokenMint, this.connection),
    ]);

    const formattedSharesAmountOut: BigNumber = sharesAmountOut.mul(new anchor.BN(shareTokenDivisor));

    try {
      const ix = await this.program.methods
        .previewAssetsIn(
          // Shares Out
          formattedSharesAmountOut,
        )
        .accounts({
          assetTokenMint,
          shareTokenMint,
          pool: poolPda,
          poolAssetTokenAccount,
          poolShareTokenAccount,
        })
        .instruction();

      const expectedAssetsIn = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);

      return {
        expectedAssetsIn,
        expectedAssetsInUI: expectedAssetsIn.div(new anchor.BN(assetTokenDivisor)).toString(),
        poolShareTokenAccount,
        poolAssetTokenAccount,
        formattedSharesAmountOut,
      };
    } catch (error: any) {
      this.logger.error('Failed to create assets in preview', error);
      throw new Error('Failed to create assets in preview.', error);
    }
  }

  public async createSwapAssetsForExactSharesInstruction({
    keys,
    args,
  }: SwapAssetsForExactSharesOperationParams): Promise<TransactionInstruction> {
    // Destructure the provided keys and arguments.
    const { userPublicKey, referrer, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, slippage, expectedAssetsIn: expectedAssetsInOverride } = args;

    let userPoolPda: PublicKey;

    try {
      // Get the user PDA for the pool.
      [userPoolPda] = findProgramAddressSync([userPublicKey.toBuffer(), poolPda.toBuffer()], this.program.programId);
    } catch (error: any) {
      this.logger.error('Failed to get user PDA for the pool.', error);
      throw new Error('Failed to get user PDA for the pool.', error);
    }

    let userShareTokenAccount: PublicKey;
    let userAssetTokenAccount: PublicKey;

    try {
      // Get the user's associated token accounts for the pool.
      userShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, userPublicKey, true);
      userAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, userPublicKey, true);
    } catch (error: any) {
      this.logger.error('Failed to get associated token accounts for the pool and creator.', error);
      throw new Error('Failed to get associated token accounts for the pool and creator.', error);
    }

    const referrerPda = referrer
      ? findProgramAddressSync([(referrer as PublicKey).toBuffer(), poolPda.toBuffer()], this.program.programId)[0]
      : null;

    const {
      poolAssetTokenAccount,
      poolShareTokenAccount,
      formattedSharesAmountOut,
      expectedAssetsIn: assetsIn,
    } = await this.previewAssetsIn({
      keys,
      args,
    });

    const expectedAssetsInWithoutSlippage = expectedAssetsInOverride ? expectedAssetsInOverride : assetsIn;
    const expectedAssetsIn = slippage
      ? expectedAssetsInWithoutSlippage
          .mul(new anchor.BN(MAX_FEE_BASIS_POINTS + slippage * 100))
          .div(new anchor.BN(MAX_FEE_BASIS_POINTS))
      : expectedAssetsInWithoutSlippage;

    // Create the program instruction.
    try {
      const swapInstruction = await this.program.methods
        .swapAssetsForExactShares(formattedSharesAmountOut, expectedAssetsIn, null, referrer ?? null)
        .accounts({
          assetTokenMint,
          shareTokenMint,
          user: userPublicKey,
          pool: poolPda,
          poolAssetTokenAccount,
          poolShareTokenAccount,
          userAssetTokenAccount,
          userShareTokenAccount,
          referrerStateInPool: referrerPda,
          userStateInPool: userPoolPda,
        })
        .instruction();
      return swapInstruction;
    } catch {
      this.logger.error('Failed to create swap assets for exact shares instruction.');
      throw new Error('Failed to create swap assets for exact shares instruction.');
    }
  }

  public async createSwapExactAssetsForSharesInstruction({
    keys,
    args,
  }: SwapExactAssetsForSharesOperationParams): Promise<TransactionInstruction> {
    // Destructure the provided keys and arguments.
    const { userPublicKey, referrer, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, slippage, expectedSharesOut: expectedSharesOutOverride } = args;

    let userPoolPda: PublicKey;

    try {
      // Get the user PDA for the pool.
      [userPoolPda] = findProgramAddressSync([userPublicKey.toBuffer(), poolPda.toBuffer()], this.program.programId);
    } catch (error: any) {
      this.logger.error('Failed to get user PDA for the pool.', error);
      throw new Error('Failed to get user PDA for the pool.', error);
    }

    let userShareTokenAccount: PublicKey;
    let userAssetTokenAccount: PublicKey;

    try {
      // Get the user's associated token accounts for the pool.
      userShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, userPublicKey, true);
      userAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, userPublicKey, true);
    } catch (error: any) {
      this.logger.error('Failed to get associated token accounts for the pool and creator.', error);
      throw new Error('Failed to get associated token accounts for the pool and creator.', error);
    }

    const referrerPda = referrer
      ? findProgramAddressSync([(referrer as PublicKey).toBuffer(), poolPda.toBuffer()], this.program.programId)[0]
      : null;

    const {
      poolAssetTokenAccount,
      poolShareTokenAccount,
      formattedAssetsAmountIn,
      expectedSharesOut: sharesOut,
    } = await this.previewSharesOut({
      keys,
      args,
    });

    const expectedSharesOutWithoutSlippage = expectedSharesOutOverride ? expectedSharesOutOverride : sharesOut;
    const expectedSharesOut = slippage
      ? expectedSharesOutWithoutSlippage
          .mul(new anchor.BN(MAX_FEE_BASIS_POINTS - slippage * 100))
          .div(new anchor.BN(MAX_FEE_BASIS_POINTS))
      : expectedSharesOutWithoutSlippage;

    try {
      const swapInstruction = await this.program.methods
        .swapExactAssetsForShares(formattedAssetsAmountIn, expectedSharesOut, null, referrer ?? null)
        .accounts({
          assetTokenMint,
          shareTokenMint,
          user: userPublicKey,
          pool: poolPda,
          poolAssetTokenAccount,
          poolShareTokenAccount,
          userAssetTokenAccount,
          userShareTokenAccount,
          referrerStateInPool: referrerPda,
          userStateInPool: userPoolPda,
        })
        .instruction();
      return swapInstruction;
    } catch (error: any) {
      this.logger.error('Failed to create swap exact assets for shares instruction.', error);
      throw new Error('Failed to create swap exact assets for shares instruction.', error);
    }
  }
}
