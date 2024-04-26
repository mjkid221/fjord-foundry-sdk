import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Connection } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { SwapExactSharesForAssetsOperationParams, SwapSharesForExactAssetsOperationParams } from '../types';

import { Logger, LoggerLike } from './logger.service';

export class LbpRedemptionService {
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

  public async closeLbpPool({ keys, args }: SwapSharesForExactAssetsOperationParams) {
    // Destructure the provided keys and arguments.
    const {
      // userPublicKey,
      creator,
      shareTokenMint,
      assetTokenMint,
    } = keys;

    const { poolPda } = args;

    // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
    const poolPdaFromParams = await this.getPoolPda(shareTokenMint, assetTokenMint, creator);

    // Check that the poolPda is valid.
    if (!poolPda.equals(poolPdaFromParams)) {
      this.logger.error('Invalid pool PDA - input poolPda does not match the expected pool PDA.');
      throw new Error('Invalid pool PDA - input poolPda does not match the expected pool PDA.');
    }

    // Get the user PDA for the pool.
    // const [userPoolPda] = findProgramAddressSync(
    //   [userPublicKey.toBuffer(), poolPda.toBuffer()],
    //   this.program.programId,
    // );
    // TODO: Add types for the keys and args
    // Get the treasury account
    const [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], this.program.programId);

    // const [ownerConfigPda] = PublicKey.findProgramAddressSync([Buffer.from('owner_config')], this.program.programId);

    // Get the treasury account info
    const treasuryAccount = await this.connection.getAccountInfo(treasuryPda);

    this.logger.debug('Treasury account info', treasuryAccount);

    // Get the pool account
    const pool = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

    // Get the user pool account
    const treasury = await this.program.account.treasury.fetch(treasuryPda);

    // Get the owner config
    // const ownerConfig = await this.program.account.ownerConfig.fetch(ownerConfigPda);

    // Get fee recipient informations.
    // !NOTE - There are two types of fee recipients in the treasury.
    // 1. Swap fee recipient - This is a single user who will receive the swap fees in asset and share token.
    // 2. Fee recipients - These are the array of users who will receive a set fee (in asset token) based on the percentage set.
    const { feeRecipients, swapFeeRecipient } = treasury;

    // Get token balances
    const poolShareTokenAccount = await getAssociatedTokenAddressSync(shareTokenMint, poolPda, true);
    const shareTokenBalancePool = await this.connection.getTokenAccountBalance(poolShareTokenAccount);
    this.logger.debug('Pool share token balance', shareTokenBalancePool);

    const poolAssetTokenAccount = await getAssociatedTokenAddressSync(assetTokenMint, poolPda, true);
    const assetTokenBalancePool = await this.connection.getTokenAccountBalance(poolAssetTokenAccount);
    this.logger.debug('Pool asset token balance', assetTokenBalancePool);

    const creatorAssetTokenAccount = await getAssociatedTokenAddressSync(assetTokenMint, creator);
    const assetTokenBalanceCreatorBeforeClose = await this.connection.getTokenAccountBalance(creatorAssetTokenAccount);
    this.logger.debug('Creator asset token balance', assetTokenBalanceCreatorBeforeClose);

    const creatorShareTokenAccount = await getAssociatedTokenAddressSync(shareTokenMint, creator);
    const shareTokenBalanceCreatorBeforeClose = await this.connection.getTokenAccountBalance(creatorShareTokenAccount);
    this.logger.debug('Creator share token balance', shareTokenBalanceCreatorBeforeClose);

    const feeRecipientAddresses = feeRecipients.map((recipient) => recipient.user.toBase58());

    const treasuryAssetTokenAccount = await getAssociatedTokenAddressSync(assetTokenMint, treasuryPda, true);

    const treasuryShareTokenAccount = await getAssociatedTokenAddressSync(shareTokenMint, treasuryPda, true);

    //TODO: Check with mj how to do this
    const feeRecipientAssetBalancesBeforeClose = await Promise.all(
      feeRecipients.map(async ({ user, percentage }) => {
        const associatedTokenAccount = await getAssociatedTokenAddressSync(assetTokenMint, user, true);
        return {
          user: user.toBase58(),
          associatedTokenAccount,
          percentage,
        };
      }),
    );

    this.logger.debug('Fee recipient asset balances before close', feeRecipientAssetBalancesBeforeClose);

    const totalAssetsInPool = new anchor.BN(assetTokenBalancePool.value.amount).sub(pool.totalSwapFeesAsset);

    this.logger.debug('Total swap fees in asset token', pool.totalSwapFeesAsset.toString());
    this.logger.debug('Total assets in pool', totalAssetsInPool.toString());

    // const MAX_FEE_BASIS_POINTS = 10000; // TODO: Why this number?

    // const platformFees = totalAssetsInPool
    //   .mul(new anchor.BN(ownerConfig.platformFee))
    //   .div(new anchor.BN(MAX_FEE_BASIS_POINTS));

    // const totalAssetsMinusFees = totalAssetsInPool.sub(platformFees).sub(pool.totalReferred);

    return {
      pool,
      treasury,
      feeRecipients,
      swapFeeRecipient: swapFeeRecipient.toBase58(),
      feeRecipientAddresses,
      treasuryAssetTokenAccount: treasuryAssetTokenAccount.toBase58(),
      treasuryShareTokenAccount: treasuryShareTokenAccount.toBase58(),
    };
  }

  public async redeemLbpTokens({ keys, args }: SwapExactSharesForAssetsOperationParams) {}
}
