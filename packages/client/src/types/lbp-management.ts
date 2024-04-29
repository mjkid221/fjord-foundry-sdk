import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

interface Provider {
  provider: AnchorProvider;
}

export interface PausePoolParams {
  poolPda: PublicKey;
  creator: PublicKey;
  shareTokenMint: PublicKey;
  assetTokenMint: PublicKey;
}

export interface PausePoolClientParams extends Provider {
  args: PausePoolParams;
}

export interface CreateNewOwnerNominationClientParams extends Provider {
  newOwnerPublicKey: PublicKey;
  creator?: PublicKey;
}

export interface NewFeeParams {
  platformFee?: number;
  referralFee?: number;
  swapFee?: number;
  ownerPublicKey: PublicKey;
}

export interface SetNewPoolFeesClientParams extends Provider {
  feeParams: NewFeeParams;
}

export interface TreasuryFeeRecipientParams {
  feeRecipient: PublicKey;
  feePercentage: number;
}
export interface SetTreasuryFeeRecipientsParams {
  swapFeeRecipient: PublicKey;
  feeRecipients: TreasuryFeeRecipientParams[];
  creator: PublicKey;
}

export interface SetTreasuryFeeRecipientsClientParams extends Provider {
  feeParams: SetTreasuryFeeRecipientsParams;
}
