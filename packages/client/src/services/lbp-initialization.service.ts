import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { INITIALIZE_LBP_IDL } from '../constants';
import { Accounts, InitializePoolParams, LbpInitializationServiceInterface } from '../types';

/**
 * A service class for initializing Liquidity Bootstrapping Pools (LBPs).
 * This service interacts with the Solana blockchain using Anchor framework.
 */
export class LbpInitializationService implements LbpInitializationServiceInterface {
  private provider: anchor.Provider;
  private programId: PublicKey;

  /**
   * Creates an instance of LbpInitializationService.
   * @param {Connection} connection - The Solana connection object.
   * @param {Wallet} wallet - The wallet used for signing transactions.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   */
  constructor(programId: PublicKey, provider: anchor.AnchorProvider) {
    // const keypair = Keypair.generate();
    // const wallet = new Wallet(keypair);
    this.provider = provider;
    this.programId = programId;
  }

  /**
   * Asynchronously creates an instance of LbpInitializationService.
   * @param {Connection} connection - The Solana connection object.
   * @param {PublicKey} programId - The public key of the program governing the LBP.
   * @returns {Promise<LbpInitializationService>} - A promise that resolves with an instance of LbpInitializationService.
   */
  static async create(programId: PublicKey, provider: anchor.AnchorProvider) {
    const service = await Promise.resolve(new LbpInitializationService(programId, provider));

    return service;
  }

  public async initializePool({ keys, args }: InitializePoolParams) {
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

    const initializePoolIdl = INITIALIZE_LBP_IDL;

    const program = new anchor.Program(initializePoolIdl, this.programId, this.provider);

    console.log('program', program);

    const [poolPda] = findProgramAddressSync(
      [shareTokenMint.toBuffer(), assetTokenMint.toBuffer(), creator.toBuffer()],
      program.programId,
    );

    const poolShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, poolPda, true);
    const poolAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, poolPda, true);

    const creatorShareTokenAccount = await getAssociatedTokenAddress(shareTokenMint, creator);
    const creatorAssetTokenAccount = await getAssociatedTokenAddress(assetTokenMint, creator);

    const accounts: Accounts = {
      creator,
      shareTokenMint,
      assetTokenMint,
      poolShareTokenAccount,
      poolAssetTokenAccount,
      creatorShareTokenAccount,
      creatorAssetTokenAccount,
    };

    console.log('accounts', accounts);

    // const events: any[] = [];
    // const poolCreationEventListener = program.addEventListener('PoolCreatedEvent', (event) => {
    //   events.push(event);
    // });

    // console.log('poolCreationEventListener', poolCreationEventListener);

    const zeroBn = new anchor.BN(0);

    try {
      const creation = await program.methods
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

      console.log('creation', creation);

      return creation;
    } catch (error: any) {
      console.error('Error initializing pool:', error);
      throw new Error('Error initializing pool', error);
    }

    // const pool = await program.account.liquidityBootstrappingPool.fetch(poolPda);
    // program.removeEventListener(poolCreationEventListener);
    // return { pool, events };
  }
}
