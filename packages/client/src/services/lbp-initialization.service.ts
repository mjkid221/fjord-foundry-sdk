import * as anchor from '@project-serum/anchor';
import { Wallet } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

import { INITIALIZE_LBP_IDL } from '../constants';
import { Accounts, InitializePoolParams } from '../types';

export class LbpInitializationService {
  private provider: anchor.Provider;
  private programId: PublicKey;

  constructor(connection: Connection, wallet: Wallet, programId: PublicKey) {
    this.provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
    this.programId = programId;
  }

  static async create(connection: Connection, wallet: Wallet, programId: PublicKey) {
    const service = await Promise.resolve(new LbpInitializationService(connection, wallet, programId));
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

    const events: any[] = [];
    const poolCreationEventListener = program.addEventListener('PoolCreatedEvent', (event) => {
      events.push(event);
    });

    await program.methods
      .initializePool(
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
      )
      .accounts(accounts)
      .rpc();

    const pool = await program.account.liquidityBootstrappingPool.fetch(poolPda);
    program.removeEventListener(poolCreationEventListener);
    return { pool, events };
  }
}
