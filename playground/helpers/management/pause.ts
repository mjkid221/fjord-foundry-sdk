import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { AnchorProvider } from '@coral-xyz/anchor';
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { PublicKey } from '@solana/web3.js';

export type PausePoolArgs = {
  poolPda: string;
  creator: string;
  shareTokenMint: string;
  assetTokenMint: string;
};

export type PausePoolParams = {
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
  args: PausePoolArgs;
};

export const pausePool = async ({ provider, sdkClient, args }: PausePoolParams) => {
  if (!provider || !sdkClient) {
    throw new Error('Required  provider, and sdkClient');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(args.creator);
  const shareTokenMint = new PublicKey(args.shareTokenMint);
  const assetTokenMint = new PublicKey(args.assetTokenMint);
  const poolPda = new PublicKey(args.poolPda);

  const pausePoolArgs = {
    poolPda,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const transaction = await sdkClient.pausePool({ programId: programAddressPublicKey, args: pausePoolArgs, provider });

  return transaction;
};

export const unpausePool = async ({ provider, sdkClient, args }: PausePoolParams) => {
  if (!provider || !sdkClient) {
    throw new Error('Required  provider, and sdkClient');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(args.creator);
  const shareTokenMint = new PublicKey(args.shareTokenMint);
  const assetTokenMint = new PublicKey(args.assetTokenMint);
  const poolPda = new PublicKey(args.poolPda);

  const unPausePoolArgs = {
    poolPda,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const transaction = await sdkClient.unPausePool({
    programId: programAddressPublicKey,
    args: unPausePoolArgs,
    provider,
  });

  return transaction;
};
