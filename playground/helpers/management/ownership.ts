import { AcceptOwnershipParams, NominateNewOwnerParams } from '@/types';
import { PublicKey } from '@solana/web3.js';

export const nominateNewOwner = async ({ formData, provider, sdkClient }: NominateNewOwnerParams) => {
  const { creator, newOwnerPublicKey } = formData.args;

  const keys = {
    creator: new PublicKey(creator),
    newOwnerPublicKey: new PublicKey(newOwnerPublicKey),
  };

  const transaction = await sdkClient.nominateNewOwner({
    provider,
    newOwnerPublicKey: keys.newOwnerPublicKey,
    creator: keys.creator,
  });

  return transaction;
};

export const acceptOwnershipNomination = async ({ formData, provider, sdkClient }: AcceptOwnershipParams) => {
  const { newOwnerPublicKey } = formData.args;

  const keys = {
    newOwnerPublicKey: new PublicKey(newOwnerPublicKey),
  };

  const transaction = await sdkClient.acceptNewOwnerNomination({
    provider,
    newOwnerPublicKey: keys.newOwnerPublicKey,
  });

  return transaction;
};
