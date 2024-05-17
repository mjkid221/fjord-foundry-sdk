import * as anchor from '@coral-xyz/anchor';
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Connection, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import * as borsh from 'borsh';

import { FjordLbp, IDL } from '../constants';
import { getTokenDivisor } from '../helpers';
import {
  CreatorTokenBalances,
  GetFeeRecipientsResponse,
  GetPoolFeesResponse,
  GetUserTokenBalanceParams,
  LbpReadServiceInterface,
  PoolReservesAndWeights,
  PoolReservesAndWeightsResponse,
  PoolTokenAccounts,
  PoolTokenBalances,
  ReservesAndWeightSchema,
  UserPoolStateBalances,
} from '../types';

import { Logger, LoggerLike } from './logger.service';

export class LbpReadService implements LbpReadServiceInterface {
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
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
    this.connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl(network));
    this.network = network;
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
    network: WalletAdapterNetwork,
    loggerEnabled: boolean,
  ): Promise<LbpReadService> {
    const service = await Promise.resolve(new LbpReadService(programId, provider, network, loggerEnabled));

    return service;
  }

  private async getOwnerConfig() {
    // Get the program address for the owner config
    const [configPda] = findProgramAddressSync([Buffer.from('owner_config')], this.program.programId);

    // Get the owner config
    const ownerConfig = await this.program.account.ownerConfig.fetch(configPda);

    return ownerConfig;
  }

  private async getTreasuryAccount() {
    // Get the treasury PDA
    const [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], this.program.programId);

    const treasuryAccount = await this.program.account.treasury.fetch(treasuryPda);

    return treasuryAccount;
  }

  private async getPool(poolPda: PublicKey) {
    // Get the pool PDA
    await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

    const pool = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

    return pool;
  }

  private async getTokenDivisorFromSupply(tokenMint: PublicKey, connection: Connection): Promise<number> {
    const tokenData = await connection.getTokenSupply(tokenMint);

    return getTokenDivisor(tokenData.value.decimals);
  }

  public async getPoolFees(): Promise<GetPoolFeesResponse> {
    // Get the owner config
    const ownerConfig = await this.getOwnerConfig();

    // Destructure the owner config fees
    const { platformFee, referralFee, swapFee } = ownerConfig;

    const formattedFees = {
      // Convert fees to percentage
      platformFee: platformFee / 100,
      referralFee: referralFee / 100,
      swapFee: swapFee / 100,
    };

    return {
      ...formattedFees,
    };
  }

  public async getPoolOwner(): Promise<PublicKey> {
    // Get the owner config
    const ownerConfig = await this.getOwnerConfig();

    return ownerConfig.owner;
  }

  public async getFeeRecipients(): Promise<GetFeeRecipientsResponse[]> {
    // Get the owner config
    const treasuryAccount = await this.getTreasuryAccount();

    const { feeRecipients } = treasuryAccount;

    return feeRecipients as any as GetFeeRecipientsResponse[];
  }

  public async getSwapFeeRecipient(): Promise<PublicKey> {
    // Get the treasury account
    const treasuryAccount = await this.getTreasuryAccount();

    return treasuryAccount.swapFeeRecipient;
  }

  public async getPoolTokenAccounts({ poolPda }: { poolPda: PublicKey }): Promise<PoolTokenAccounts> {
    // Read the pool
    try {
      const pool = await this.getPool(poolPda);

      const { assetToken, shareToken } = pool;

      const poolShareTokenAccount = await getAssociatedTokenAddress(shareToken, poolPda, true);
      const poolAssetTokenAccount = await getAssociatedTokenAddress(assetToken, poolPda, true);

      return { poolShareTokenAccount, poolAssetTokenAccount };
    } catch (error) {
      this.logger.error('Pool not found');
      throw new Error('Pool not found');
    }
  }

  public async getPoolTokenBalances({ poolPda }: { poolPda: PublicKey }): Promise<PoolTokenBalances> {
    // Get the pool asset token account
    const { poolAssetTokenAccount, poolShareTokenAccount } = await this.getPoolTokenAccounts({ poolPda });

    // Get the balance of the pool asset token account
    const poolAssetTokenAccountInfo = await this.connection.getTokenAccountBalance(poolAssetTokenAccount);

    const poolShareTokenAccountInfo = await this.connection.getTokenAccountBalance(poolShareTokenAccount);
    if (!poolAssetTokenAccountInfo.value.uiAmount) {
      this.logger.error('Pool asset token account not found');
      throw new Error('Pool asset token account not found');
    }

    if (!poolShareTokenAccountInfo.value.uiAmount) {
      this.logger.error('Pool share token account not found');
      throw new Error('Pool share token account not found');
    }

    return {
      poolShareTokenBalance:
        poolShareTokenAccountInfo.value.uiAmountString ?? poolShareTokenAccountInfo.value.uiAmount.toString(),
      poolAssetTokenBalance:
        poolAssetTokenAccountInfo.value.uiAmountString ?? poolAssetTokenAccountInfo.value.uiAmount.toString(),
    };
  }

  public async getCreatorTokenBalances({ poolPda }: { poolPda: PublicKey }): Promise<CreatorTokenBalances> {
    // Get the creator of the pool
    const { creator, assetToken, shareToken } = await this.getPool(poolPda);

    const creatorPoolShareTokenAccount = await getAssociatedTokenAddress(shareToken, creator);
    const creatorPoolAssetTokenAccount = await getAssociatedTokenAddress(assetToken, creator);

    const creatorShareTokenBalance = await this.connection.getTokenAccountBalance(creatorPoolShareTokenAccount);
    const creatorAssetTokenBalance = await this.connection.getTokenAccountBalance(creatorPoolAssetTokenAccount);

    this.logger.debug('Creator share token balance', creatorShareTokenBalance);

    if (!creatorShareTokenBalance.value.uiAmount) {
      this.logger.error('Creator share token account not found');
      throw new Error('Creator share token account not found');
    }

    if (!creatorAssetTokenBalance.value.uiAmount) {
      this.logger.error('Creator asset token account not found');
      throw new Error('Creator asset token account not found');
    }

    return {
      creatorShareTokenBalance:
        creatorShareTokenBalance.value.uiAmountString ?? creatorShareTokenBalance.value.uiAmount.toString(),
      creatorAssetTokenBalance:
        creatorAssetTokenBalance.value.uiAmountString ?? creatorAssetTokenBalance.value.uiAmount.toString(),
    };
  }

  public async getUserPoolStateBalances({
    poolPda,
    userPublicKey,
  }: GetUserTokenBalanceParams): Promise<UserPoolStateBalances> {
    try {
      // Get the user pool pda
      const [userPoolPda] = findProgramAddressSync(
        [userPublicKey.toBuffer(), poolPda.toBuffer()],
        this.program.programId,
      );

      // Get the user state in pool
      const { purchasedShares, redeemedShares, referredAssets } =
        await this.program.account.userStateInPool.fetch(userPoolPda);

      const { assetToken, shareToken } = await this.getPool(poolPda);

      const shareTokenDivisor = await this.getTokenDivisorFromSupply(shareToken, this.connection);
      const assetTokenDivisor = await this.getTokenDivisorFromSupply(assetToken, this.connection);

      return {
        purchasedShares: (Number(purchasedShares.toString()) / shareTokenDivisor).toString(),
        redeemedShares: (Number(redeemedShares.toString()) / shareTokenDivisor).toString(),
        referredAssets: (Number(referredAssets.toString()) / assetTokenDivisor).toString(),
      };
    } catch (error: any) {
      this.logger.error('User token balances not found', error);
      throw new Error(error);
    }
  }

  public async getPoolReservesAndWeights({ poolPda }: { poolPda: PublicKey }): Promise<PoolReservesAndWeights> {
    try {
      const { assetToken: assetTokenMint, shareToken: shareTokenMint } = await this.getPool(poolPda);

      const poolShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, poolPda, true);
      const poolAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, poolPda, true);

      const ix = await this.program.methods
        .reservesAndWeights()
        .accounts({
          pool: poolPda,
          assetTokenMint,
          shareTokenMint,
          poolAssetTokenAccount,
          poolShareTokenAccount,
        })
        .instruction();

      const txSimulation = await this.connection.simulateTransaction(
        new VersionedTransaction(
          new TransactionMessage({
            // Example key
            payerKey: new PublicKey('AMufp7u55mQ8VxNCtE5Cm3ufCQQQvxJmonGFo9SfU5tM'),
            recentBlockhash: (await this.connection.getLatestBlockhash()).blockhash,
            instructions: [ix],
          }).compileToV0Message(),
        ),
      );

      if (txSimulation.value.err) {
        this.logger.error('Unable to simulate preview transaction', txSimulation.value.err);
        throw new Error('Unable to simulate preview transaction');
      }

      let data: PoolReservesAndWeightsResponse | null = null;
      if (txSimulation.value.returnData?.data) {
        data = borsh.deserialize(
          ReservesAndWeightSchema,
          Buffer.from(base64.decode(txSimulation?.value?.returnData?.data[0])),
        ) as PoolReservesAndWeightsResponse;
      } else {
        const returnPrefix = `Program return: ${this.program.programId} `;
        const returnLogEntry = txSimulation.value.logs!.find((log) => log.startsWith(returnPrefix));
        if (returnLogEntry) {
          data = borsh.deserialize(
            ReservesAndWeightSchema,
            Buffer.from(base64.decode(returnLogEntry.slice(returnPrefix.length))),
          ) as PoolReservesAndWeightsResponse;
        }
      }

      if (!data) {
        throw new Error('Pool reserves and weights not found');
      }
      const { asset_reserve, share_reserve, asset_weight, share_weight } = data;
      return {
        assetReserve: asset_reserve.toString(),
        shareReserve: share_reserve.toString(),
        assetWeight: asset_weight.toString(),
        shareWeight: share_weight.toString(),
      };
    } catch (error: any) {
      this.logger.error('Pool reserves and weights not found', error);
      throw new Error(error);
    }
  }
}
