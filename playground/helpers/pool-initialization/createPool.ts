import { FjordClientSdk, InitializePoolResponse } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider, BN } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { z } from 'zod';

import { PERCENTAGE_BASIS_POINTS, DEFAULT_SALE_START_TIME_BN, DEFAULT_SALE_END_TIME_BN } from '@/constants';
import { initializePoolArgsSchema } from '@/types';

type CreatePoolParams = {
  formData: z.infer<typeof initializePoolArgsSchema>;
  connection: Connection;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};

export const createPool = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: CreatePoolParams): Promise<InitializePoolResponse> => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  // const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  const programAddressPublicKey = new PublicKey('AXRGWPXpgTKK9NrqLji4zbPeyiiDp2gkjLGUJJunLKUm');
  const creator = new PublicKey(formData.args.creator);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);

  const assets = new BN(formData.args.assets);
  const shares = new BN(formData.args.shares);
  const maxAssetsIn = new BN(formData.args.maxAssetsIn);
  const maxSharePrice = new BN(formData.args.maxSharePrice);
  const maxSharesOut = new BN(formData.args.maxSharesOut);
  const startWeightBasisPoints = Number(formData.args.startWeightBasisPoints) * PERCENTAGE_BASIS_POINTS;
  const endWeightBasisPoints = Number(formData.args.endWeightBasisPoints) * PERCENTAGE_BASIS_POINTS;
  const saleStartTime = DEFAULT_SALE_START_TIME_BN;
  const saleEndTime = DEFAULT_SALE_END_TIME_BN;

  const keys = {
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    assets,
    shares,
    maxAssetsIn,
    maxSharePrice,
    maxSharesOut,
    startWeightBasisPoints,
    endWeightBasisPoints,
    saleStartTime,
    saleEndTime,
  };

  // const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

  return await sdkClient.createPoolTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  // await signTransaction(transactionInstruction);

  // const pool = await sdkClient.retrievePoolData(poolPda, programAddressPublicKey, provider);

  // return pool;
};
