import { SwapAssetsForSharesParams } from '@/types';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export const swapExactAssetsForShares = async ({
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

  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const assetsAmountIn = new BN(formData.args.assetsAmountIn);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    assetsAmountIn,
  };

  const transaction = await sdkClient.createSwapExactAssetsForSharesTransaction({
    keys,
    args,
    provider,
  });

  return transaction;
};
