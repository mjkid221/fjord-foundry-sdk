import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { FjordLbp, INITIALIZE_LBP_IDL } from '../constants';
import { formatEpochDate, getTokenDivisor } from '../helpers';
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
  private network: WalletAdapterNetwork;

  /**
   * Creates an instance of LbpInitializationService.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @param {anchor.AnchorProvider} provider - The Anchor provider object.
   *
   * @constructor
   * @returns {LbpInitializationService} - An instance of LbpInitializationService.
   */
  constructor(programId: PublicKey, provider: anchor.AnchorProvider, network: WalletAdapterNetwork) {
    this.provider = provider;
    this.programId = programId;
    this.program = new anchor.Program(INITIALIZE_LBP_IDL, programId, provider);
    this.network = network;
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
    const solanaNetwork = anchor.web3.clusterApiUrl(this.network);
    const connection = new anchor.web3.Connection(solanaNetwork);

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

    // Fetch the token supply data for the asset and share tokens.
    const assetTokenData = await connection.getTokenSupply(assetTokenMint);
    const shareTokenData = await connection.getTokenSupply(shareTokenMint);

    // Calculate the token divisors for the asset and share tokens.
    const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
    const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);

    // Define the zero BN value for optional parameters. TODO: This can probably be moved to a constants file.
    const zeroBn = new anchor.BN(0);

    // Format the provided parameters to BN values.
    const formattedAssets = new anchor.BN(assets * assetTokenDivisor);
    const formattedShares = new anchor.BN(shares * shareTokenDivisor);
    const formattedVirtualAssets = virtualAssets ? new anchor.BN(virtualAssets * assetTokenDivisor) : zeroBn;
    const formattedVirtualShares = virtualShares ? new anchor.BN(virtualShares * shareTokenDivisor) : zeroBn;
    const formattedMaxAssetsIn = new anchor.BN(maxAssetsIn * assetTokenDivisor);
    const formattedMaxSharesOut = new anchor.BN(maxSharesOut * shareTokenDivisor);

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

    // Initialize the pool with the provided parameters.
    try {
      const transactionInstruction = await this.program.methods
        .initializePool(
          formattedAssets,
          formattedShares,
          formattedVirtualAssets,
          formattedVirtualShares,
          maxSharePrice,
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

      // Return the transaction instruction and pool PDA.
      return { transactionInstruction, poolPda };
    } catch (error: any) {
      console.error('Error initializing pool:', error);
      throw new Error('Error initializing pool', error);
    }
  }

  public async getPoolData(poolPda: PublicKey, network: WalletAdapterNetwork): Promise<GetPoolDataResponse> {
    const solanaNetwork = anchor.web3.clusterApiUrl(network);
    const connection = new anchor.web3.Connection(solanaNetwork);

    try {
      const poolData = await this.program.account.liquidityBootstrappingPool.fetch(poolPda);

      const assetTokenData = await connection.getTokenSupply(poolData.assetToken);
      const shareTokenData = await connection.getTokenSupply(poolData.shareToken);

      const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
      const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);

      const formattedMaxSharesOut = poolData.maxSharesOut.toNumber() / shareTokenDivisor;
      const formattedMaxAssetsIn = poolData.maxAssetsIn.toNumber() / assetTokenDivisor;

      const formattedSaleStartTime = formatEpochDate(poolData.saleStartTime);
      const formattedSaleEndTime = formatEpochDate(poolData.saleEndTime);

      return {
        ...poolData,
        assetToken: poolData.assetToken.toBase58(),
        creator: poolData.creator.toBase58(),
        shareToken: poolData.shareToken.toBase58(),
        maxSharesOut: formattedMaxSharesOut,
        maxSharePrice: poolData.maxSharePrice.toString(),
        maxAssetsIn: formattedMaxAssetsIn,
        saleEndTime: formattedSaleEndTime,
        saleStartTime: formattedSaleStartTime,
        vestCliff: poolData.vestCliff.toString(),
        vestEnd: poolData.vestEnd.toString(),
        virtualAssets: poolData.virtualAssets.toString(),
        virtualShares: poolData.virtualShares.toString(),
      };
    } catch (error: any) {
      console.error('Error fetching pool data:', error);
      throw new Error('Error fetching pool data', error);
    }
  }
}
