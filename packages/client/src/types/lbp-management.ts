import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

interface ProgramIdAndProvider {
  programId: PublicKey;
  provider: AnchorProvider;
}

export interface PausePoolParams {
  poolPda: PublicKey;
  creator: PublicKey;
  shareTokenMint: PublicKey;
  assetTokenMint: PublicKey;
}

export interface PausePoolClientParams extends ProgramIdAndProvider {
  args: PausePoolParams;
}

export interface CreateNewOwnerNominationClientParams extends ProgramIdAndProvider {
  newOwnerPublicKey: PublicKey;
  creator?: PublicKey;
}

export interface NewFeeParams {
  platformFee?: number;
  referralFee?: number;
  swapFee?: number;
  ownerPublicKey: PublicKey;
}

export interface SetNewPoolFeesClientParams extends ProgramIdAndProvider {
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

export interface SetTreasuryFeeRecipientsClientParams extends ProgramIdAndProvider {
  feeParams: SetTreasuryFeeRecipientsParams;
}
