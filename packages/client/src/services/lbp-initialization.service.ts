import * as anchor from '@coral-xyz/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { FjordLbp, IDL } from '../constants';
import { getTokenDivisor } from '../helpers';
import { Accounts, InitializePoolParams, InitializePoolResponse, LbpInitializationServiceInterface } from '../types';

import { Logger, LoggerLike } from './logger.service';

/**
 * A service class for initializing Liquidity Bootstrapping Pools (LBPs).
 * This service interacts with the Solana blockchain using Anchor framework.
 */
export class LbpInitializationService implements LbpInitializationServiceInterface {
  private provider: anchor.Provider;

  private programId: PublicKey;

  private program: anchor.Program<FjordLbp>;

  private network: WalletAdapterNetwork;

  private logger: LoggerLike;

  /**
   * Creates an instance of LbpInitializationService.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {anchor.AnchorProvider} provider - The Anchor provider object.
   * @param {WalletAdapterNetwork} network - The Solana network to interact with.
   *
   * @constructor
   * @returns {LbpInitializationService} - An instance of LbpInitializationService.
   */
  constructor(programId: PublicKey, provider: anchor.AnchorProvider, network: WalletAdapterNetwork) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(IDL, programId, provider);
    this.network = network;
    this.logger = Logger('LbpInitializationService', true);
    this.logger.debug('LbpInitializationService initialized');
  }

  /**
   * Asynchronously creates an instance of LbpInitializationService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @returns {Promise<LbpInitializationService>} - A promise that resolves with an instance of LbpInitializationService.
   */
  static async create(
    programId: PublicKey,
    provider: anchor.AnchorProvider,
    network: WalletAdapterNetwork,
  ): Promise<LbpInitializationService> {
    const service = await Promise.resolve(new LbpInitializationService(programId, provider, network));

    return service;
  }

  public async initializePool({ keys, args }: InitializePoolParams): Promise<InitializePoolResponse> {
    // Fetch the Solana network URL based on the provided network.
    const solanaNetwork = anchor.web3.clusterApiUrl(this.network);
    const connection = new anchor.web3.Connection(solanaNetwork);

    // Destructure the provided keys and arguments.
    const { creator, shareTokenMint, assetTokenMint } = keys;

    const {
      assets,
      shares,
      virtualAssets,
      virtualShares,
      maxSharePrice,
      maxSharesOut,
      maxAssetsIn,
      startWeightBasisPoints,
      endWeightBasisPoints,
      saleStartTime,
      saleEndTime,
      vestCliff,
      vestEnd,
      whitelistMerkleRoot,
      sellingAllowed,
    } = args;

    try {
      // Fetch the token supply data for the asset and share tokens.
      const assetTokenData = await connection.getTokenSupply(assetTokenMint);
      const shareTokenData = await connection.getTokenSupply(shareTokenMint);

      // Calculate the token divisors for the asset and share tokens.
      const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
      const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);

      // Define the zero BN value for optional parameters.
      const zeroBn = new anchor.BN(0);

      // Format the provided parameters to BN values.
      const formattedAssets = assets.mul(new anchor.BN(assetTokenDivisor));
      const formattedShares = shares.mul(new anchor.BN(shareTokenDivisor));
      const formattedVirtualAssets = virtualAssets ? virtualAssets.mul(new anchor.BN(assetTokenDivisor)) : zeroBn;
      const formattedVirtualShares = virtualShares ? virtualShares.mul(new anchor.BN(shareTokenDivisor)) : zeroBn;
      const formattedMaxAssetsIn = maxAssetsIn.mul(new anchor.BN(assetTokenDivisor));
      const formattedMaxSharesOut = maxSharesOut.mul(new anchor.BN(shareTokenDivisor));
      const formattedMaxSharePrice = maxSharePrice.mul(new anchor.BN(shareTokenDivisor));

      if (formattedAssets.gt(formattedMaxAssetsIn)) {
        this.logger.error('Initial assets cannot exceed max assets in');
        throw new Error('Initial assets cannot exceed max assets in');
      }

      // Find the pre-determined pool Program Derived Address (PDA) from the share token mint, asset token mint, and creator.
      const [poolPda] = findProgramAddressSync(
        [shareTokenMint.toBuffer(), assetTokenMint.toBuffer(), creator.toBuffer()],
        this.program.programId,
      );

      // Find the associated token accounts for the pool and creator.
      const poolShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, poolPda, true);
      const poolAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, poolPda, true);

      const creatorShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, creator);
      const creatorAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, creator);

      // Define the accounts to be used in the transaction.
      const accounts: Accounts = {
        creator,
        shareTokenMint,
        assetTokenMint,
        poolShareTokenAccount,
        poolAssetTokenAccount,
        creatorShareTokenAccount,
        creatorAssetTokenAccount,
      };

      this.logger.debug('Initializing pool with the following parameters:', {
        assets: formattedAssets.toString(),
        shares: formattedShares.toString(),
        virtualAssets: formattedVirtualAssets.toString(),
        virtualShares: formattedVirtualShares.toString(),
        maxSharePrice: formattedMaxSharePrice.toString(),
        maxSharesOut: formattedMaxSharesOut.toString(),
        maxAssetsIn: formattedMaxAssetsIn.toString(),
        startWeightBasisPoints: startWeightBasisPoints.toString(),
        endWeightBasisPoints: endWeightBasisPoints.toString(),
        saleStartTime: saleStartTime.toString(),
        saleEndTime: saleEndTime.toString(),
        vestCliff: vestCliff?.toString(),
        vestEnd: vestEnd?.toString(),
        whitelistMerkleRoot: whitelistMerkleRoot?.toString(),
        sellingAllowed: sellingAllowed ? sellingAllowed.toString() : false,
      });

      // Initialize the pool with the provided parameters.

      const transactionInstruction = await this.program.methods
        .initializePool(
          formattedAssets,
          formattedShares,
          formattedVirtualAssets,
          formattedVirtualShares,
          formattedMaxSharePrice,
          formattedMaxSharesOut,
          formattedMaxAssetsIn,
          startWeightBasisPoints,
          endWeightBasisPoints,
          saleStartTime,
          saleEndTime,
          vestCliff ?? zeroBn,
          vestEnd ?? zeroBn,
          whitelistMerkleRoot ?? [],
          sellingAllowed ?? false,
        )
        .accounts(accounts)
        .instruction();

      this.logger.debug('Pool initialized successfully');
      this.logger.info(`New pool PDA: ${poolPda.toBase58()}`);
      // Return the transaction instruction and pool PDA.
      return { transactionInstruction, poolPda };
    } catch (error: any) {
      this.logger.error('Error initializing pool', error);
      throw new Error('Error initializing pool', error);
    }
  }

  /**
   * Fetches the data associated with a liquidity bootstrapping pool.
   * @param poolPda - The public key of the pool's Program Derived Address (PDA).
   * @returns {Promise<LiquidityBootstrappingPool>} A promise resolving to the fetched pool data object.
   * @throws {Error} If there's an error during the pool data retrieval process.
   */
  public async getPoolData(poolPda: PublicKey) {
    try {
      return await this.program.account.liquidityBootstrappingPool.fetch(poolPda);
    } catch (error: any) {
      this.logger.error('Error fetching pool data:', error);
      throw new Error('Error fetching pool data', error);
    }
  }
}
