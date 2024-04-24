import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export interface PausePoolParams {
  poolPda: PublicKey;
  creator: PublicKey;
  shareTokenMint: PublicKey;
  assetTokenMint: PublicKey;
}

export interface PausePoolClientParams {
  args: PausePoolParams;
  programId: PublicKey;
  provider: AnchorProvider;
}
