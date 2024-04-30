import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export interface CloseOperationPublicKeys {
  keys: {
    userPublicKey: PublicKey;
    creator: PublicKey;
    shareTokenMint: PublicKey;
    assetTokenMint: PublicKey;
  };
  args: {
    poolPda: PublicKey;
  };
  programId: PublicKey;
  provider: AnchorProvider;
}

export interface RedeemOperationPublicKeys extends CloseOperationPublicKeys {
  args: {
    poolPda: PublicKey;
    isReferred: boolean;
  };
}
