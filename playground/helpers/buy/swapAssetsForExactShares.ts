import { SwapAssetsForSharesParams } from '@/types';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export const swapAssetsForExactShares = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapAssetsForSharesParams) => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  if (!formData.args.sharesAmountOut) {
    throw new Error('Shares amount out is required');
  }

  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const sharesAmountOut = new BN(formData.args.sharesAmountOut);
  const slippage = formData.args.slippage;

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    sharesAmountOut,
    slippage,
  };

  const transaction = await sdkClient.createSwapAssetsForExactSharesTransaction({
    keys,
    args,
    provider,
  });

  return transaction;
};

export const previewAssetsInAmount = async ({
  formData,
  provider,
  sdkClient,
}: Omit<SwapAssetsForSharesParams, 'connection'>) => {
  if (!provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  if (!formData.args.sharesAmountOut) {
    throw new Error('Shares amount out is required');
  }

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

  const args = {
    poolPda,
    sharesAmountOut,
  };

  const sharesOutAmount = await sdkClient.previewAssetsIn({
    keys,
    args,
    provider,
  });

  return sharesOutAmount;
};
