import { SetNewPoolFeesParams, SetTreasuryFeeRecipientsParams } from '@/types';
import { PublicKey } from '@solana/web3.js';

export const setNewPoolFees = async ({ formData, provider, sdkClient }: SetNewPoolFeesParams) => {
  const { ownerPublicKey, platformFee, referralFee, swapFee } = formData;

  const keys = {
    ownerPublicKey: new PublicKey(ownerPublicKey),
  };

  const transaction = await sdkClient.setNewPoolFees({
    provider,
    feeParams: {
      ownerPublicKey: keys.ownerPublicKey,
      platformFee: platformFee ? parseFloat(platformFee) : undefined,
      referralFee: referralFee ? parseFloat(referralFee) : undefined,
      swapFee: swapFee ? parseFloat(swapFee) : undefined,
    },
  });

  return transaction;
};

export const setNewTreasuryFeeRecipients = async ({
  formData,
  provider,
  sdkClient,
}: SetTreasuryFeeRecipientsParams) => {
  const { swapFeeRecipient, feeRecipients, creator } = formData;

  const keys = {
    swapFeeRecipient: new PublicKey(swapFeeRecipient),
    creator: new PublicKey(creator),
    feeRecipients: feeRecipients.map(({ feeRecipient, feePercentage }) => ({
      feeRecipient: new PublicKey(feeRecipient),
      feePercentage: parseFloat(feePercentage),
    })),
  };

  const transaction = await sdkClient.setTreasuryFeeRecipients({
    provider,
    feeParams: {
      swapFeeRecipient: keys.swapFeeRecipient,
      feeRecipients: keys.feeRecipients,
      creator: keys.creator,
    },
  });

  return transaction;
};
