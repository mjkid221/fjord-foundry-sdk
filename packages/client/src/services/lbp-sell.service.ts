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
  ): Promise<LbpSellService> {
    const service = await Promise.resolve(new LbpSellService(programId, provider, network));

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

  private async getConnection(): Promise<Connection> {
    const solanaNetwork = anchor.web3.clusterApiUrl(this.network);
    const connection = new anchor.web3.Connection(solanaNetwork);

    return connection;
  }

  public async createSwapExactSharesForAssetsInstruction({
    keys,
    args,
  }: SwapExactSharesForAssetsOperationParams): Promise<TransactionInstruction> {
    // Destructure the provided keys and arguments.
    const { userPublicKey, creator, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, sharesAmountOut: incomingSharesAmount } = args;

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

    const shareTokenDivisor = await this.getTokenDivisorFromSupply(shareTokenMint, this.connection);

    const formattedIncomingSharesAmount = incomingSharesAmount.mul(new anchor.BN(shareTokenDivisor));

    let minOutgoingAssetAmount: BigNumber;

    try {
      const ix = await this.program.methods
        .previewAssetsOut(formattedIncomingSharesAmount)
        .accounts({ assetTokenMint, shareTokenMint, pool: poolPda, poolAssetTokenAccount, poolShareTokenAccount })
        .instruction();

      minOutgoingAssetAmount = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);
    } catch (error: any) {
      this.logger.error('Failed to create swap exact shares for assets instruction preview.', error);
      throw new Error('Failed to create swap exact shares for assets instruction preview.', error);
    }

    // Create the instruction.
    try {
      const swapInstruction = await this.program.methods
        .swapExactSharesForAssets(formattedIncomingSharesAmount, minOutgoingAssetAmount, null, null)
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
    const { userPublicKey, creator, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, assetsAmountIn: outgoingAssetsAmount } = args;

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

    const shareTokenBalance = await this.connection.getTokenAccountBalance(userShareTokenAccount);

    this.logger.debug('User share token balance:', shareTokenBalance.value.amount.toString());

    const assetTokenDivisor = await this.getTokenDivisorFromSupply(assetTokenMint, this.connection);

    const formattedOutgoingAssetsAmount: BigNumber = outgoingAssetsAmount.mul(new anchor.BN(assetTokenDivisor));

    this.logger.debug('Formatted outgoing assets amount:', formattedOutgoingAssetsAmount.toString());

    let maxIncomingSharesAmount: BigNumber;

    // create the swap preview

    try {
      const ix = await this.program.methods
        .previewSharesIn(formattedOutgoingAssetsAmount)
        .accounts({ assetTokenMint, shareTokenMint, pool: poolPda, poolAssetTokenAccount, poolShareTokenAccount })
        .instruction();

      maxIncomingSharesAmount = await this.simulatePreviewsAndReturnValue(ix, userPublicKey);
    } catch (error: any) {
      this.logger.error('Failed to create shares for exact assets instruction preview.', error);
      throw new Error('Failed to create shares for exact assets instruction preview.', error);
    }

    this.logger.debug('Expected max shares incoming:', maxIncomingSharesAmount.toString());
    // Create the instruction.
    try {
      const swapInstruction = await this.program.methods
        .swapSharesForExactAssets(formattedOutgoingAssetsAmount, maxIncomingSharesAmount, null, null)
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
