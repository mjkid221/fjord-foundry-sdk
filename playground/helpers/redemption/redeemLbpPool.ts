import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { RedeemTokensParams } from '@/types';
import { PublicKey } from '@solana/web3.js';

export const redeemLbpPool = async ({ formData, connection, provider, sdkClient }: RedeemTokensParams) => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(formData.args.creator);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const poolPda = new PublicKey(formData.args.poolPda);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    isReferred: formData.args.isReferred,
  };

  const transaction = await sdkClient.redeemTokensTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};
