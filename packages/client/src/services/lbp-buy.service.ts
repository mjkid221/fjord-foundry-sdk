import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { getTokenDivisor } from '../helpers';
import { BuyOperationParams } from '../types';

import { Logger, LoggerLike } from './logger.service';

export class LbpBuyService {
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
  }: BuyOperationParams): Promise<TransactionInstruction> {
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
    // const assetTokenData = await connection.getTokenSupply(assetTokenMint);
    const shareTokenData = await connection.getTokenSupply(shareTokenMint);

    this.logger.debug('shareTokenData', shareTokenData);

    // Calculate the token divisors for the asset and share tokens.
    const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
    // const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);
    this.logger.debug('sharesAmountOut', sharesAmountOut);
    this.logger.debug('shareTokenDivisor', shareTokenDivisor);

    const formattedSharesAmountOut: anchor.BN = sharesAmountOut.mul(new anchor.BN(shareTokenDivisor));

    this.logger.debug('Formatted shares amount out:', formattedSharesAmountOut.toString());

    const referrerPda = referrer
      ? findProgramAddressSync([(referrer as PublicKey).toBuffer(), poolPda.toBuffer()], this.program.programId)[0]
      : null;

    // Get the pool state account.
    const pool = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

    this.logger.debug('Pool state:', pool);

    // Check that the shares amount out is less than or equal to the maximum shares out.
    // if (formattedSharesAmountOut.gt(maxSharesOut)) {
    //   this.logger.error('Invalid shares amount out - exceeds the maximum shares out.');
    //   throw new Error('Invalid shares amount out - exceeds the maximum shares out.');
    // }

    const mockSigner = Keypair.generate();

    let expectedAssetsIn: anchor.BN;

    // Create the swap transaction preview.
    // Get expected shares out by reading a view function's emitted event.
    try {
      expectedAssetsIn = await this.program.methods
        .previewAssetsIn(
          // Shares Out
          sharesAmountOut,
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
        .then((data) => data.events[0].data.assetsIn as anchor.BN);
    } catch (error: any) {
      this.logger.error('Failed to create swap assets for exact shares instruction preview.', error);
      throw new Error('Failed to create swap assets for exact shares instruction preview.', error);
    }

    this.logger.debug('Expected assets in:', expectedAssetsIn.toString());

    // Create the program instruction.
    try {
      const swapInstruction = await this.program.methods
        .swapAssetsForExactShares(sharesAmountOut, expectedAssetsIn, null, referrer ?? null)
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

  public async createSwapExactAssetsForSharesInstruction() {}
}
