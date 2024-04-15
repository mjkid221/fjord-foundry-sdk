import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { FjordLbp, INITIALIZE_LBP_IDL } from '../constants';
import {
  Accounts,
  GetPoolDataResponse,
  InitializePoolParams,
  InitializePoolResponse,
  LbpInitializationServiceInterface,
} from '../types';

/**
 * A service class for initializing Liquidity Bootstrapping Pools (LBPs).
 * This service interacts with the Solana blockchain using Anchor framework.
 */
export class LbpInitializationService implements LbpInitializationServiceInterface {
  private provider: anchor.Provider;
  private programId: PublicKey;
  private program: anchor.Program<FjordLbp>;

  /**
   * Creates an instance of LbpInitializationService.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {anchor.AnchorProvider} provider - The Anchor provider object.
   *
   * @constructor
   * @returns {LbpInitializationService} - An instance of LbpInitializationService.
   */
  constructor(programId: PublicKey, provider: anchor.AnchorProvider) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(INITIALIZE_LBP_IDL, programId, provider);
  }

  /**
   * Asynchronously creates an instance of LbpInitializationService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @returns {Promise<LbpInitializationService>} - A promise that resolves with an instance of LbpInitializationService.
   */
  static async create(programId: PublicKey, provider: anchor.AnchorProvider): Promise<LbpInitializationService> {
    const service = await Promise.resolve(new LbpInitializationService(programId, provider));

    return service;
  }

  public async initializePool({ keys, args }: InitializePoolParams): Promise<InitializePoolResponse> {
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

    // Define the zero BN value for optional parameters. TODO: This can probably be moved to a constants file.
    const zeroBn = new anchor.BN(0);

    // Initialize the pool with the provided parameters.
    try {
      const transactionInstruction = await this.program.methods
        .initializePool(
          assets,
          shares,
          virtualAssets ?? zeroBn,
          virtualShares ?? zeroBn,
          maxSharePrice,
          maxSharesOut,
          maxAssetsIn,
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

      // Return the transaction instruction and pool PDA.
      return { transactionInstruction, poolPda };
    } catch (error: any) {
      console.error('Error initializing pool:', error);
      throw new Error('Error initializing pool', error);
    }
  }

  /**
   * Retrieves the args of a liquidity bootstrapping pool.
   *
   * @param poolPda - The public key of the pool's PDA.
   * @returns The pool's args.
   */
  public async getPoolData(poolPda: PublicKey, network: WalletAdapterNetwork): Promise<GetPoolDataResponse> {
    const solanaNetwork = anchor.web3.clusterApiUrl(network);
    const connection = new anchor.web3.Connection(solanaNetwork);

    const poolData = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

    const assetTokenData = await connection.getTokenSupply(poolData.assetToken);
    const assetTokenDecimals = assetTokenData.value.decimals;
    const shareTokenData = await connection.getTokenSupply(poolData.shareToken);
    const shareTokenDecimals = shareTokenData.value.decimals;

    const formattedMaxSharesOut = poolData.maxSharesOut.toNumber() / Math.pow(10, shareTokenDecimals);
    const formattedMaxAssetsIn = poolData.maxAssetsIn.toNumber() / Math.pow(10, assetTokenDecimals);

    return {
      ...poolData,
      assetToken: poolData.assetToken.toBase58(),
      creator: poolData.creator.toBase58(),
      shareToken: poolData.shareToken.toBase58(),
      maxSharesOut: formattedMaxSharesOut,
      maxSharePrice: poolData.maxSharePrice.toString(),
      maxAssetsIn: formattedMaxAssetsIn,
      saleEndTime: poolData.saleEndTime.toString(),
      saleStartTime: poolData.saleStartTime.toString(),
      vestCliff: poolData.vestCliff.toString(),
      vestEnd: poolData.vestEnd.toString(),
      virtualAssets: poolData.virtualAssets.toString(),
      virtualShares: poolData.virtualShares.toString(),
    };
  }
}
