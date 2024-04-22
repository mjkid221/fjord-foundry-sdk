import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { swapAssetsForSharesArgsSchema } from '@/types';
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider, BN } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { z } from 'zod';

type SwapAssetsForExactSharesParams = {
  formData: z.infer<typeof swapAssetsForSharesArgsSchema>;
  connection: Connection;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};

export const swapAssetsForExactShares = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapAssetsForExactSharesParams) => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const sharesAmountOut = new BN(formData.args.sharesAmountOut);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  console.log('keys', keys.assetTokenMint.toString());

  const args = {
    poolPda,
    sharesAmountOut,
  };

  const transaction = await sdkClient.createSwapAssetsForExactSharesTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};
