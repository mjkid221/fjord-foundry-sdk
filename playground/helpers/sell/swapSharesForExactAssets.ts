import { SwapSharesForAssetsParams } from '@/types';
import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export const swapSharesForExactAssets = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapSharesForAssetsParams) => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  if (!formData.args.assetsAmountOut) {
    throw new Error('Assets amount in is required');
  }

  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const assetsAmountOut = new BN(formData.args.assetsAmountOut);
  const slippage = formData.args.slippage;

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    assetsAmountOut,
    slippage,
  };

  const transaction = await sdkClient.createSwapSharesForExactAssetsTransaction({
    keys,
    args,
    provider,
  });

  return transaction;
};

export const previewSharesInAmount = async ({
  formData,
  provider,
  sdkClient,
}: Omit<SwapSharesForAssetsParams, 'connection'>) => {
  if (!provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  if (!formData.args.assetsAmountOut) {
    throw new Error('Assets amount in is required');
  }

  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const assetsAmountOut = new BN(formData.args.assetsAmountOut);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    assetsAmountOut,
  };

  const sharesInAmount = await sdkClient.previewSharesIn({
    keys,
    args,
    provider,
  });

  return sharesInAmount;
};
