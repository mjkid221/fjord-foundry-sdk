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
  const slippage = formData.args.slippage;

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    assetsAmountIn,
    slippage,
  };

  const transaction = await sdkClient.createSwapExactAssetsForSharesTransaction({
    keys,
    args,
    provider,
  });

  return transaction;
};

export const previewSharesOutAmount = async ({
  formData,
  provider,
  sdkClient,
}: Omit<SwapAssetsForSharesParams, 'connection'>) => {
  if (!provider || !sdkClient) {
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

  const sharesOutAmount = await sdkClient.previewSharesOut({
    keys,
    args,
    provider,
  });

  return sharesOutAmount;
};
