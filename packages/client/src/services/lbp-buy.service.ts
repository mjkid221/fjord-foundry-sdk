import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
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
  LbpBuyServiceInterface,
  SwapExactSharesForAssetsOperationParams,
  SwapSharesForExactAssetsOperationParams,
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

  constructor(programId: PublicKey, provider: anchor.AnchorProvider, network: WalletAdapterNetwork) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
    this.connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl(network));
    this.network = network;
    this.logger = Logger('LbpBuyService', true);
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
  ): Promise<LbpBuyService> {
    const service = await Promise.resolve(new LbpBuyService(programId, provider, network));

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

  private async getTokenDivisorFromSupply(tokenMint: PublicKey, connection: Connection): Promise<number> {
    const tokenData = await connection.getTokenSupply(tokenMint);

    return getTokenDivisor(tokenData.value.decimals);
  }

  public async createSwapAssetsForExactSharesInstruction({
    keys,
    args,
  }: SwapExactSharesForAssetsOperationParams): Promise<TransactionInstruction> {
    // Destructure the provided keys and arguments.
    const { userPublicKey, creator, referrer, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, sharesAmountOut } = args;

    // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
    const poolPdaFromParams = await this.getPoolPda(shareTokenMint, assetTokenMint, creator);

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

    const [ownerConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('owner_config')], this.program.programId);

    // Find the associated token accounts for the pool and creator.
    const poolShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, poolPda, true);
    const poolAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, poolPda, true);

    // Get the user's associated token accounts for the pool.
    const userShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, userPublicKey, true);
    const userAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, userPublicKey, true);

    const referrerPda = referrer
      ? findProgramAddressSync([(referrer as PublicKey).toBuffer(), poolPda.toBuffer()], this.program.programId)[0]
      : null;

    const shareTokenDivisor = await this.getTokenDivisorFromSupply(shareTokenMint, this.connection);
    const assetTokenDivisor = await this.getTokenDivisorFromSupply(assetTokenMint, this.connection);

    const formattedSharesAmountOut: BigNumber = sharesAmountOut.mul(new anchor.BN(shareTokenDivisor));

    let expectedAssetsIn: BigNumber;

    // Create the swap transaction preview.
    // Get expected shares out by reading a view function's emitted event.
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

      expectedAssetsIn = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);
    } catch (error: any) {
      this.logger.error('Failed to create swap assets for exact shares instruction preview.', error);
      throw new Error('Failed to create swap assets for exact shares instruction preview.', error);
    }
    this.logger.debug('Expected assets in:', expectedAssetsIn.toString());

    const formattedExpectedAssetsIn: BigNumber = expectedAssetsIn.div(new anchor.BN(assetTokenDivisor));

    this.logger.debug('Formatted expected assets in:', formattedExpectedAssetsIn.toString());
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
          config: ownerConfigPda,
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
  }: SwapSharesForExactAssetsOperationParams): Promise<TransactionInstruction> {
    // Destructure the provided keys and arguments.
    const { userPublicKey, creator, referrer, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, assetsAmountIn } = args;

    // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
    const poolPdaFromParams = await this.getPoolPda(shareTokenMint, assetTokenMint, creator);

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

    // Find the associated token accounts for the pool and creator.
    const poolShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, poolPda, true);
    const poolAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, poolPda, true);

    // Get the user's associated token accounts for the pool.
    const userShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, userPublicKey, true);
    const userAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, userPublicKey, true);

    const referrerPda = referrer
      ? findProgramAddressSync([(referrer as PublicKey).toBuffer(), poolPda.toBuffer()], this.program.programId)[0]
      : null;

    const tokenDivisor = await this.getTokenDivisorFromSupply(assetTokenMint, this.connection);

    const formattedAssetsAmountIn: BigNumber = assetsAmountIn.mul(new anchor.BN(tokenDivisor));

    let expectedSharesOut: BigNumber;

    // Create the swap transaction preview.
    // Get expected shares out by reading a view function's emitted event.
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

      expectedSharesOut = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);
    } catch (error: any) {
      this.logger.error('Failed to create swap exact assets for shares instruction preview.', error);
      throw new Error('Failed to create swap exact assets for shares instruction preview.', error);
    }

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
