import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { SwapAssetsForSharesParams } from '@/types';
import { BigNumber } from '@fjord-foundry/solana-sdk-client';
import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export const swapSharesForExactAssets = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapAssetsForSharesParams) => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  if (!formData.args.assetsAmountIn) {
    throw new Error('Assets amount in is required');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const outgoingAssetsAmount = new BN(formData.args.assetsAmountIn);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    assetsAmountIn: outgoingAssetsAmount as BigNumber,
  };

  const transaction = await sdkClient.createSwapSharesForExactAssetsTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};
