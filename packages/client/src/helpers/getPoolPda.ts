import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { PublicKey } from '@solana/web3.js';

type GetPoolPdaParams = {
  shareTokenMint: PublicKey;
  assetTokenMint: PublicKey;
  creator: PublicKey;
  programId: PublicKey;
  salt: string;
};

/**
 * Get the PDA for a given LBP.
 *
 * @param {GetPoolPdaParams} params - The parameters to get the pool PDA.
 * @param {PublicKey} params.shareTokenMint - The share token mint.
 * @param {PublicKey} params.assetTokenMint - The asset token mint.
 * @param {PublicKey} params.creator - The creator of the pool.
 * @param {PublicKey} params.programId - The program ID of the LBP.
 * @returns {Promise<PublicKey>} - A promise that resolves with the the pool PDA as a `PublicKey`.
 */
export const getPoolPda = async ({
  shareTokenMint,
  assetTokenMint,
  creator,
  programId,
  salt,
}: GetPoolPdaParams): Promise<PublicKey> => {
  const [poolPda] = findProgramAddressSync(
    [shareTokenMint.toBuffer(), assetTokenMint.toBuffer(), creator.toBuffer(), Buffer.from(salt)],
    programId,
  );

  return poolPda;
};
