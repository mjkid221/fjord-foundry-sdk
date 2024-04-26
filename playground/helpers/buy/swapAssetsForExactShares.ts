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
    keys,
    args,
    provider,
  });

  return transaction;
};
