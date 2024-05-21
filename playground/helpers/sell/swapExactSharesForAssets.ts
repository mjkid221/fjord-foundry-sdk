import { SwapSharesForAssetsParams } from '@/types';
import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export const swapExactSharesForAssets = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapSharesForAssetsParams) => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  if (!formData.args.sharesAmountIn) {
    throw new Error('Shares amount in is required');
  }

  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const sharesAmountIn = new BN(formData.args.sharesAmountIn);
  const slippage = formData.args.slippage;

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    sharesAmountIn,
    slippage,
  };

  const transaction = await sdkClient.createSwapExactSharesForAssetsTransaction({
    keys,
    args,
    provider,
  });

  return transaction;
};

export const previewAssetsOutAmount = async ({
  formData,
  provider,
  sdkClient,
}: Omit<SwapSharesForAssetsParams, 'connection'>) => {
  if (!provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  if (!formData.args.sharesAmountIn) {
    throw new Error('Shares amount in is required');
  }

  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const sharesAmountIn = new BN(formData.args.sharesAmountIn);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    sharesAmountIn,
  };

  const assetsOutAmount = await sdkClient.previewAssetsOut({ keys, args, provider });
  return assetsOutAmount;
};
