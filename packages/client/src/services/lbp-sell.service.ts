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
    this.logger = Logger('LbpBuyService', loggerEnabled);
    this.logger.debug('LbpBuyService initialized');
  }

  /**
   * Asynchronously creates an instance of LbpSellService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {WalletAdapterNetwork} network - The Solana network to use.
   * @returns {Promise<LbpBuyService>} - A promise that resolves with an instance of LbpSellService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
    loggerEnabled: boolean,
  ): Promise<LbpSellService> {
    const service = await Promise.resolve(new LbpSellService(programId, provider, network, loggerEnabled));

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

    const [assetTokenDivisor, shareTokenDivisor] = await Promise.all([
      this.getTokenDivisorFromSupply(assetTokenMint, this.connection),
      this.getTokenDivisorFromSupply(shareTokenMint, this.connection),
    ]);

    const formattedSharesAmountIn = sharesAmountIn.mul(new anchor.BN(shareTokenDivisor));

    try {
      const ix = await this.program.methods
        .previewAssetsOut(formattedSharesAmountIn)
        .accounts({ assetTokenMint, shareTokenMint, pool: poolPda, poolAssetTokenAccount, poolShareTokenAccount })
        .instruction();

      const expectedMinAssetsOut = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);
      return {
        expectedMinAssetsOut,
        expectedMinAssetsOutUI: expectedMinAssetsOut.div(new anchor.BN(assetTokenDivisor)).toString(),
        poolShareTokenAccount,
        poolAssetTokenAccount,
        formattedSharesAmountIn,
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

    const [assetTokenDivisor, shareTokenDivisor] = await Promise.all([
      this.getTokenDivisorFromSupply(assetTokenMint, this.connection),
      this.getTokenDivisorFromSupply(shareTokenMint, this.connection),
    ]);

    const formattedAssetsOut = assetsAmountOut.mul(new anchor.BN(assetTokenDivisor));

    try {
      const ix = await this.program.methods
        .previewSharesIn(formattedAssetsOut)
        .accounts({ assetTokenMint, shareTokenMint, pool: poolPda, poolAssetTokenAccount, poolShareTokenAccount })
        .instruction();

      const expectedMaxSharesIn = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);
      return {
        expectedMaxSharesIn,
        expectedMaxSharesInUI: expectedMaxSharesIn.div(new anchor.BN(shareTokenDivisor)).toString(),
        poolShareTokenAccount,
        poolAssetTokenAccount,
        formattedAssetsOut,
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
    const { poolPda, slippage, expectedMinAssetsOut: expectedAssetsOutOverride } = args;

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

    const {
      poolShareTokenAccount,
      poolAssetTokenAccount,
      formattedSharesAmountIn,
      expectedMinAssetsOut: assetsOut,
    } = await this.previewAssetsOut({
      keys,
      args,
    });

    const expectedAssetsOutWithoutSlippage = expectedAssetsOutOverride ? expectedAssetsOutOverride : assetsOut;
    const expectedAssetsOut = slippage
      ? expectedAssetsOutWithoutSlippage
          .mul(new anchor.BN(MAX_FEE_BASIS_POINTS - slippage * 100))
          .div(new anchor.BN(MAX_FEE_BASIS_POINTS))
      : expectedAssetsOutWithoutSlippage;

    // Create the instruction.
    try {
      const swapInstruction = await this.program.methods
        .swapExactSharesForAssets(formattedSharesAmountIn, expectedAssetsOut, null, null)
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
    const { poolPda, slippage, expectedMaxSharesIn: expectedSharesInOverride } = args;

    // Get the user PDA for the pool.
    const [userPoolPda] = findProgramAddressSync(
      [userPublicKey.toBuffer(), poolPda.toBuffer()],
      this.program.programId,
    );

    // Get the user's associated token accounts for the pool.
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

    const {
      poolShareTokenAccount,
      poolAssetTokenAccount,
      formattedAssetsOut,
      expectedMaxSharesIn: sharesIn,
    } = await this.previewSharesIn({
      keys,
      args,
    });

    this.logger.log('slippage: ', slippage);
    const expectedSharesInWithoutSlippage = expectedSharesInOverride ? expectedSharesInOverride : sharesIn;
    const expectedSharesIn = slippage
      ? expectedSharesInWithoutSlippage
          .mul(new anchor.BN(MAX_FEE_BASIS_POINTS + slippage * 100))
          .div(new anchor.BN(MAX_FEE_BASIS_POINTS))
      : expectedSharesInWithoutSlippage;

    // Create the instruction.
    try {
      const swapInstruction = await this.program.methods
        .swapSharesForExactAssets(formattedAssetsOut, expectedSharesIn, null, null)
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
