import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { getTokenDivisor } from '../helpers';
import {
  BigNumber,
  LbpBuyServiceInterface,
  SwapExactSharesForAssetsOperationParams,
  SwapSharesWithExactAssetsOperationParams,
} from '../types';

import { Logger, LoggerLike } from './logger.service';

export class LbpBuyService implements LbpBuyServiceInterface {
  private provider: anchor.Provider;

  private programId: PublicKey;

  private program: anchor.Program<FjordLbp>;

  private network: WalletAdapterNetwork;

  private logger: LoggerLike;

  constructor(programId: PublicKey, provider: anchor.AnchorProvider, network: WalletAdapterNetwork) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
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

  public async createSwapAssetsForExactSharesInstruction({
    keys,
    args,
  }: SwapExactSharesForAssetsOperationParams): Promise<TransactionInstruction> {
    // Fetch the Solana network URL based on the provided network.
    const solanaNetwork = anchor.web3.clusterApiUrl(this.network);
    const connection = new anchor.web3.Connection(solanaNetwork);

    // Destructure the provided keys and arguments.
    const { userPublicKey, creator, referrer, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, sharesAmountOut } = args;

    // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
    const [poolPdaFromParams] = findProgramAddressSync(
      [shareTokenMint.toBuffer(), assetTokenMint.toBuffer(), creator.toBuffer()],
      this.program.programId,
    );

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
    // Fetch the token supply data for the asset and share tokens.
    const shareTokenData = await connection.getTokenSupply(shareTokenMint);

    // Calculate the token divisors for the asset and share tokens.
    const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
    this.logger.debug('sharesAmountOut', sharesAmountOut);
    this.logger.debug('shareTokenDivisor', shareTokenDivisor);

    const formattedSharesAmountOut: BigNumber = sharesAmountOut.mul(new anchor.BN(shareTokenDivisor));

    this.logger.debug('Formatted shares amount out:', formattedSharesAmountOut.toString());

    const referrerPda = referrer
      ? findProgramAddressSync([(referrer as PublicKey).toBuffer(), poolPda.toBuffer()], this.program.programId)[0]
      : null;

    // Get the pool state account.
    const pool = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

    this.logger.debug('Pool state:', pool);

    const mockSigner = Keypair.generate();

    let expectedAssetsIn: BigNumber;

    // Create the swap transaction preview.
    // Get expected shares out by reading a view function's emitted event.
    try {
      expectedAssetsIn = await this.program.methods
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
        .signers([mockSigner])
        .simulate()
        .then((data) => data.events[0].data.assetsIn as BigNumber);
    } catch (error: any) {
      this.logger.error('Failed to create swap assets for exact shares instruction preview.', error);
      throw new Error('Failed to create swap assets for exact shares instruction preview.', error);
    }

    this.logger.debug('Expected assets in:', expectedAssetsIn.toString());

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
  }: SwapSharesWithExactAssetsOperationParams): Promise<TransactionInstruction> {
    // Fetch the Solana network URL based on the provided network.
    const solanaNetwork = anchor.web3.clusterApiUrl(this.network);
    const connection = new anchor.web3.Connection(solanaNetwork);

    // Destructure the provided keys and arguments.
    const { userPublicKey, creator, referrer, shareTokenMint, assetTokenMint } = keys;

    const { poolPda, assetsAmountIn } = args;

    // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
    const [poolPdaFromParams] = findProgramAddressSync(
      [shareTokenMint.toBuffer(), assetTokenMint.toBuffer(), creator.toBuffer()],
      this.program.programId,
    );

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
    // Fetch the token supply data for the asset and share tokens.
    const assetTokenData = await connection.getTokenSupply(assetTokenMint);

    const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);

    const formattedAssetsAmountIn: BigNumber = assetsAmountIn.mul(new anchor.BN(assetTokenDivisor));

    const referrerPda = referrer
      ? findProgramAddressSync([(referrer as PublicKey).toBuffer(), poolPda.toBuffer()], this.program.programId)[0]
      : null;

    // Get the pool state account.
    const pool = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

    this.logger.debug('Pool state:', pool);

    const mockSigner = Keypair.generate();

    let expectedSharesOut: BigNumber;

    // Create the swap transaction preview.
    // Get expected shares out by reading a view function's emitted event.
    try {
      expectedSharesOut = await this.program.methods
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
        .signers([mockSigner])
        .simulate()
        .then((data) => data.events[0].data.sharesOut as BigNumber);
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
