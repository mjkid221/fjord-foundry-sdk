import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { ClosePoolParams } from '@/types';
import { PublicKey } from '@solana/web3.js';

export const closeLbpPool = async ({ formData, connection, provider, sdkClient }: ClosePoolParams) => {
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
  };

  const transactions = await sdkClient.closePoolTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transactions;
};
